// src/context/AuthContext.tsx
import React, {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import type {Session, User} from '@supabase/supabase-js';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({data}) => {
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
        });

        const {data: listener} = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession ?? null);
            setUser(newSession?.user ?? null);
        });

        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user, session, signOut}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
