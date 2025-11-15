// src/types/database.types.ts

// Тип для вашої таблиці profiles
export interface Profile {
    id: string; // uuid
    updated_at?: string;
    display_name: string;
    avatar_url: string;
    bio: string;
    role: string; // Або ваш 'user_role' enum
    location?: string; // geometry(Point, 4326)
    is_location_public: boolean;
    // Додайте 'wallet' якщо ви додали його в таблицю
}

// Тип для таблиці scenarios
export interface Scenario {
    id: number; // bigint
    created_at: string;
    title: string;
    description: string;
    price: number; // numeric
    creator_id: string; // uuid
}

// Тип для таблиці orders
export interface Order {
    id: number; // bigint
    created_at: string;
    scenario_id: number;
    customer_id: string;
    status: string; // 'pending' | 'in_progress' | 'completed'...
}