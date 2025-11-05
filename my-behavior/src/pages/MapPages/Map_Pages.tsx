import * as React from "react";
import Map, {Marker} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWhkc3Npbm4wNmE5MmtxeXpocnN4ZWV5In0.0TPGtpyy97o6UA7ycgZelA";

export default function LiveMap() {
    const users = [
        {id: 1, name: "Anna", lat: 50.45, lon: 30.52},
        {id: 2, name: "Bohdan", lat: 50.47, lon: 30.5},
    ];

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
                mapStyle="mapbox://styles/mapbox/dark-v11"
            >
                {users.map((u) => (
                    <Marker
                        key={u.id}
                        latitude={u.lat}
                        longitude={u.lon}
                        anchor="center"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"/>
                            <div className="w-4 h-4 bg-green-500 rounded-full border border-white"/>
                            <span className="text-xs text-white mt-1">{u.name}</span>
                        </div>
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
