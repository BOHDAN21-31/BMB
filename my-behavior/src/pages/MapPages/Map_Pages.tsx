import * as React from "react";
import Map, {Marker} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

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
                mapStyle="mapbox://styles/buymybihavior/cmhwmy9a600i001qugw869we8"
            >
                {users.map((u) => (
                    <Marker
                        key={u.id}
                        latitude={u.lat}
                        longitude={u.lon}
                        anchor="center"
                    >
                    </Marker>
                ))}
            </Map>
        </div>
    );
}
