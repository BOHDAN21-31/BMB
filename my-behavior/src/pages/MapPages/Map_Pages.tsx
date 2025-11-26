import React, {useState, useEffect} from "react";
import Map, {Marker} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {supabase} from "../../lib/supabaseClient";
import {useNavigate} from "react-router-dom";
import Nav_bar from "../../Nav_bar"; // <--- 1. Імпорт Навбару

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

interface MapUser {
    id: string;
    longitude: number;
    latitude: number;
    avatar_url: string;
    display_name: string;
}

interface FullProfile extends MapUser {
    bio: string;
    role: string;
}

interface UserScenario {
    id: number;
    title: string;
    description: string;
    price: number;
}

export default function LiveMap() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<MapUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<FullProfile | null>(null);
    const [userScenarios, setUserScenarios] = useState<UserScenario[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const {data, error} = await supabase.rpc('get_public_map_users');
                if (error) throw error;
                if (data) setUsers(data as MapUser[]);
            } catch (error: any) {
                console.error("Помилка карти:", error.message);
            }
        };
        fetchUsers();
    }, []);

    const handleMarkerClick = async (userId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setLoadingDetails(true);
        setSidebarOpen(true);

        try {
            const {data: profileData, error: profileError} = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            const {data: scenariosData, error: scenariosError} = await supabase
                .from('scenarios')
                .select('*')
                .eq('creator_id', userId);

            if (scenariosError) throw scenariosError;

            setSelectedUser(profileData as FullProfile);
            setUserScenarios(scenariosData as UserScenario[]);

        } catch (error) {
            console.error("Помилка завантаження деталей:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        setSelectedUser(null);
    };

    const handleOrderClick = () => {
        if (selectedUser) {
            navigate('/create-order', {state: {performerId: selectedUser.id}});
        }
    };

    return (
        <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-gray-100 overscroll-none touch-none">

            {/* 2. ДОДАНО NAV_BAR (плаваючий зверху) */}
            <div className="absolute top-0 left-0 w-full z-40 pointer-events-auto">
                <Nav_bar/>
            </div>

            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    latitude: 50.4501,
                    longitude: 30.5234,
                    zoom: 12,
                }}
                style={{width: "100%", height: "100%"}}
                mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
                onClick={closeSidebar}
                scrollZoom={true}
            >
                {users.map((u) => (
                    <Marker
                        key={u.id}
                        latitude={u.latitude}
                        longitude={u.longitude}
                        anchor="center"
                    >
                        <div
                            className="cursor-pointer transition-transform hover:scale-110 active:scale-95 relative"
                            onClick={(e) => handleMarkerClick(u.id, e)}
                        >
                            <div className="rounded-full shadow-[0_0_15px_#ffcdd6]">
                                <img
                                    src={u.avatar_url || "/logo_for_reg.jpg"}
                                    alt={u.display_name}
                                    className="w-12 h-12 rounded-full border-[3px] border-white object-cover"
                                />
                            </div>
                        </div>
                    </Marker>
                ))}
            </Map>

            <div
                className={`
                    absolute 
                    top-[15px]            
                    right-0 
                    h-[calc(100%-100px)]  
                    w-full sm:w-[400px] 
                    bg-white shadow-2xl z-[50] 
                    transform transition-transform duration-300 ease-in-out
                    flex flex-col 
                    rounded-l-3xl border-l border-y border-gray-100
                    ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="absolute top-4 left-4 z-20">
                    <button
                        onClick={closeSidebar}
                        className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-gray-100 shadow-sm border border-gray-200 transition"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain relative rounded-l-3xl">
                    {loadingDetails ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="text-gray-500 animate-pulse">Завантаження профілю...</span>
                        </div>
                    ) : selectedUser ? (
                        <div className="flex flex-col p-6">

                            <div className="flex justify-center mb-4 mt-4">
                                <div className="w-28 h-28 rounded-full shadow-[0_0_20px_#ffcdd6]">
                                    <img
                                        src={selectedUser.avatar_url || "/logo_for_reg.jpg"}
                                        alt="Profile"
                                        className="w-full h-full rounded-full border-[4px] border-white object-cover"
                                    />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-center mb-1 text-gray-900">
                                {selectedUser.display_name || "Користувач"}
                            </h2>

                            <div className="flex flex-col items-center justify-center gap-1 mb-4">
                                {selectedUser.role && (
                                    <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                        {selectedUser.role}
                                    </span>
                                )}

                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400">★★★★★</div>
                                    <span className="font-bold text-sm text-gray-800">10.0</span>
                                    <button
                                        className="px-3 py-1 bg-gray-50 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100">
                                        Відгуки
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center mb-8">
                                <div
                                    className="bg-gray-100 text-gray-800 px-5 py-4 rounded-2xl text-sm font-medium shadow-sm border border-gray-200 text-center leading-relaxed w-full">
                                    {selectedUser.bio ? (
                                        <>
                                            <span
                                                className="block text-gray-400 text-[10px] uppercase tracking-wider mb-2">
                                                Здібності
                                            </span>
                                            “{selectedUser.bio}”
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic">
                                            Користувач ще не описав свої здібності...
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 my-2"></div>

                            <h3 className="text-gray-400 font-bold text-xs uppercase mb-4 mt-4 tracking-wider text-center">
                                Сценарії виконавця
                            </h3>

                            <div className="space-y-4">
                                {userScenarios.length > 0 ? (
                                    userScenarios.map((scenario) => (
                                        <div key={scenario.id}
                                             className="bg-pink-50/80 p-4 rounded-2xl border border-pink-100 hover:border-pink-200 transition relative group">
                                            <h4 className="font-bold text-gray-800 mb-1 pr-12 text-sm">{scenario.title}</h4>
                                            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                                                {scenario.description}
                                            </p>
                                            <div
                                                className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-[10px] font-bold shadow-sm text-pink-600 border border-pink-50">
                                                {scenario.price} USDT
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <span className="text-2xl mb-2">📝</span>
                                        <span className="text-sm">Сценаріїв поки немає</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 mb-[25px]">
                                <button
                                    onClick={handleOrderClick}
                                    className="w-full bg-black text-white font-bold py-4 rounded-full text-lg shadow-xl hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    <span>Замовити поведінку</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </button>
                            </div>

                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}