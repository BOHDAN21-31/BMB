import React, {useState, useEffect} from "react";
import Map, {Marker} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {supabase} from "../../lib/supabaseClient";

// Ваш Mapbox токен
const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

// Тип для користувачів на карті
interface MapUser {
    id: string;
    longitude: number;
    latitude: number;
    avatar_url: string;
    display_name: string;
}

export default function LiveMap() {
    // Стан для зберігання користувачів, яких треба показати
    const [users, setUsers] = useState<MapUser[]>([]);

    useEffect(() => {
        // Асинхронна функція для завантаження користувачів
        const fetchUsers = async () => {
            try {
                // Викликаємо RPC-функцію 'get_public_map_users',
                // яку ви створили в Supabase SQL Editor.
                const {data, error} = await supabase.rpc('get_public_map_users');

                if (error) {
                    // Обробляємо помилку запиту
                    console.error("Помилка RPC-запиту:", error.message);
                    throw error;
                }

                if (data) {
                    // Встановлюємо дані у стан.
                    // 'data' вже має правильний тип завдяки функції.
                    setUsers(data as MapUser[]);
                }
            } catch (error: any) {
                console.error("Не вдалось завантажити користувачів для карти:", error.message);
            }
        };

        // Викликаємо функцію при завантаженні компонента
        fetchUsers();

        // (Опційно) Тут можна додати підписку на Supabase Realtime
        // для оновлення позицій в реальному часі.

    }, []); // Порожній масив означає, що ефект виконається 1 раз

    return (
        <div className="h-screen w-full">
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    latitude: 50.4501,  // Початкові координати (Київ)
                    longitude: 30.5234,
                    zoom: 12,
                }}
                style={{width: "100%", height: "100%"}}
                mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
            >
                {/* Проходимо по масиву 'users' і створюємо маркер для кожного */}
                {users.map((u) => (
                    <Marker
                        key={u.id}
                        latitude={u.latitude}
                        longitude={u.longitude}
                        anchor="center"
                    >
                        {/* Використовуємо аватарку користувача як маркер */}
                        <img
                            src={u.avatar_url || "/logo_for_reg.jpg"} // Запасне фото
                            alt={u.display_name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            title={u.display_name} // Показуємо ім'я при наведенні
                        />
                    </Marker>
                ))}
            </Map>
        </div>
    );
}