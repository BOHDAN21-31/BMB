import React, {useState, useEffect} from "react";
import Map, {Marker} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {supabase} from "../../lib/supabaseClient";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

interface MapUser {
    id: string;
    longitude: number;
    latitude: number;
    avatar_url: string;
    display_name: string;
}

export default function LiveMap() {
    const [users, setUsers] = useState<MapUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const {data, error} = await supabase.rpc('get_public_map_users');

                if (error) {
                    console.error("Помилка RPC-запиту:", error.message);
                    throw error;
                }

                if (data) {
                    setUsers(data as MapUser[]);
                }
            } catch (error: any) {
                console.error("Не вдалось завантажити користувачів для карти:", error.message);
            }
        };
        fetchUsers();
    }, []);
    return (
        <div className="h-screen w-full">
            <Map
                mapboxAccessToken={MAPBOX_TOKEN}
                initialViewState={{
                    latitude: 50.4501,
                    longitude: 30.5234,
                    zoom: 12,
                }}
                style={{width: "100%", height: "100%"}}
                mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
            >
                {users.map((u) => (
                    <Marker
                        key={u.id}
                        latitude={u.latitude}
                        longitude={u.longitude}
                        anchor="center"
                    >
                        <img
                            src={u.avatar_url || "/logo_for_reg.jpg"}
                            alt={u.display_name}
                            className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                            title={u.display_name}
                        />
                    </Marker>
                ))}
            </Map>
        </div>
    );
}