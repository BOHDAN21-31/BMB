import React, {useState, useEffect, useRef} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import Map, {Marker, Source, Layer, NavigationControl, MapRef} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {supabase} from "../../lib/supabaseClient";
import {useAuth} from "../../context/AuthProvider";
import {toast} from 'react-toastify';
// import OrderChat from "../components/OrderChat";

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

// Стилі ліній
const walkingLayer: any = {
    id: 'route-walking',
    type: 'line',
    layout: {'line-join': 'round', 'line-cap': 'round'},
    paint: {'line-color': '#007bff', 'line-width': 5, 'line-opacity': 0.8, 'line-dasharray': [1, 2]}
};

const drivingLayer: any = {
    id: 'route-driving',
    type: 'line',
    layout: {'line-join': 'round', 'line-cap': 'round'},
    paint: {'line-color': '#ff4081', 'line-width': 6, 'line-opacity': 0.8}
};

export default function OrderDetailsPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {orderId} = useParams();
    const location = useLocation();
    const mapRef = useRef<MapRef>(null);

    const [request, setRequest] = useState<any>(location.state?.request || null);
    const [loading, setLoading] = useState(!location.state?.request);
    const [loadingAction, setLoadingAction] = useState(false);

    // Навігація
    const [transportMode, setTransportMode] = useState<'walking' | 'driving' | 'cycling'>('walking');
    const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
    const [routeInfo, setRouteInfo] = useState<{ duration: number, distance: number } | null>(null);
    const [myCoords, setMyCoords] = useState<{ lat: number, lng: number } | null>(null);

    // Пошук
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Інше
    const [timeLeft, setTimeLeft] = useState<string>("");
    const [isChatOpen, setIsChatOpen] = useState(false);

    // 1. ЗАВАНТАЖЕННЯ ДАНИХ
    useEffect(() => {
        if (!request && orderId) {
            const fetchOrder = async () => {
                const {data: orderData, error} = await supabase
                    .from('orders')
                    .select(`*, scenarios(title, description, price), profiles!orders_customer_id_fkey(display_name, avatar_url), performer:profiles!orders_performer_id_fkey(display_name, avatar_url)`)
                    .eq('id', orderId)
                    .single();

                if (error || !orderData) {
                    navigate('/my-orders');
                    return;
                }

                const isIAmCustomer = user?.id === orderData.customer_id;
                const otherUser = isIAmCustomer ? orderData.performer : orderData.profiles;

                setRequest({
                    ...orderData,
                    title: orderData.scenarios.title,
                    description: orderData.scenarios.description,
                    price: orderData.scenarios.price,
                    other_name: otherUser?.display_name,
                    other_avatar: otherUser?.avatar_url,
                    location_lat: location.state?.request?.location_lat,
                    location_lng: location.state?.request?.location_lng
                });
                setLoading(false);
            };
            fetchOrder();
        }
    }, [orderId, request, user]);

    // 2. LIVE TRACKING
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setMyCoords({lat: pos.coords.latitude, lng: pos.coords.longitude});
            },
            (err) => console.error("GPS Error:", err),
            {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 3. АВТО-ОНОВЛЕННЯ МАРШРУТУ
    useEffect(() => {
        if (myCoords && request?.location_lat && request?.location_lng) {
            buildRoute(myCoords.lng, myCoords.lat, request.location_lng, request.location_lat);
        }
    }, [transportMode, myCoords]);

    // 4. ТАЙМЕР
    useEffect(() => {
        if (!request || request.status !== 'in_progress') return;
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(request.execution_time).getTime();
            const dist = target - now;
            if (dist < 0) {
                setTimeLeft("00:00:00");
            } else {
                const h = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((dist % (1000 * 60)) / 1000);
                setTimeLeft(`${h}г ${m}хв ${s}с`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [request]);

    // --- ФУНКЦІЇ ---
    const handleSearchInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.length > 2) {
            try {
                const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?access_token=${MAPBOX_TOKEN}&country=ua&limit=5`);
                const data = await res.json();
                setSuggestions(data.features || []);
            } catch (e) {
            }
        } else {
            setSuggestions([]);
        }
    };

    const selectSuggestion = (feature: any) => {
        const [lng, lat] = feature.center;
        setMyCoords({lat, lng});
        setSearchQuery(feature.place_name);
        setSuggestions([]);
        setIsSearching(false);
        mapRef.current?.flyTo({center: [lng, lat], zoom: 14});
    };

    const buildRoute = async (startLng: number, startLat: number, endLng: number, endLat: number) => {
        try {
            const query = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${transportMode}/${startLng},${startLat};${endLng},${endLat}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`);
            const json = await query.json();
            if (!json.routes?.length) return;

            const data = json.routes[0];
            setRouteGeoJSON({
                type: 'Feature',
                properties: {},
                geometry: {type: 'LineString', coordinates: data.geometry.coordinates}
            });
            setRouteInfo({
                duration: Math.floor(data.duration / 60),
                distance: parseFloat((data.distance / 1000).toFixed(2))
            });
        } catch (e) {
        }
    };

    const centerOnMe = () => {
        if (myCoords) {
            mapRef.current?.flyTo({center: [myCoords.lng, myCoords.lat], zoom: 15, pitch: 45});
        } else {
            toast.info("Шукаємо супутники...");
        }
    };

    const openGoogleMaps = () => {
        if (!request.location_lat) return;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${request.location_lat},${request.location_lng}&travelmode=transit`;
        window.open(url, '_blank');
    };

    // --- ДІЇ ЗАМОВЛЕННЯ ---

    const handleAccept = async () => {
        setLoadingAction(true);
        try {
            const {error} = await supabase
                .from('orders')
                .update({status: 'in_progress'})
                .eq('id', request.order_id || request.id);

            if (error) throw error;
            toast.success("✅ Замовлення прийнято!");
            navigate('/MyOrders');
        } catch (err: any) {
            toast.error("Помилка: " + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDecline = async () => {
        if (!confirm("Відхилити це замовлення?")) return;
        setLoadingAction(true);
        try {
            const {error} = await supabase
                .from('orders')
                .update({status: 'cancelled'})
                .eq('id', request.order_id || request.id);

            if (error) throw error;
            toast.info("Відхилено.");
            navigate('/GetScenario');
        } catch (err: any) {
            toast.error("Помилка: " + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleComplete = async () => {
        if (!confirm("Ви впевнені, що завдання виконано?")) return;
        setLoadingAction(true);
        try {
            const {error} = await supabase
                .from('orders')
                .update({status: 'completed'})
                .eq('id', request.order_id || request.id);

            if (error) throw error;
            toast.success("🎉 Вітаємо! Завдання завершено.");
            navigate('/my-orders');
        } catch (err: any) {
            toast.error("Помилка: " + err.message);
        } finally {
            setLoadingAction(false);
        }
    };

    if (loading || !request) return <div className="p-10 text-center">Завантаження...</div>;

    const hasCoords = request.location_lat && request.location_lng;

    // Визначаємо статус для відображення кнопок
    const isPending = ['pending', 'paid_pending_execution', 'pending_execution'].includes(request.status);
    const isInProgress = request.status === 'in_progress';

    return (
        <div className="min-h-screen bg-gray-50 relative pb-[140px]">

            {/* Header + Search */}
            <div className="absolute top-0 left-0 w-full z-20 px-4 py-4 pointer-events-none">
                <div
                    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_10px_40px_-10px_#ffcdd6] border border-white pointer-events-auto">
                    <div className="flex items-center px-4 py-3 gap-2">
                        <button onClick={() => navigate(-1)} className="text-gray-500 pr-2 border-r border-gray-200">←
                        </button>
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onFocus={() => setIsSearching(true)}
                                placeholder="Ваша позиція..."
                                className="w-full bg-transparent outline-none text-sm font-medium text-gray-800 placeholder-gray-400"
                            />
                            {suggestions.length > 0 && isSearching && (
                                <ul className="absolute top-10 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    {suggestions.map((s) => (
                                        <li key={s.id} onClick={() => selectSuggestion(s)}
                                            className="px-4 py-3 text-xs hover:bg-[#fff0f5] cursor-pointer border-b border-gray-50 last:border-0">
                                            {s.place_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button onClick={centerOnMe} className="text-blue-500 animate-pulse">🎯</button>
                    </div>
                </div>
            </div>

            {/* MAP */}
            <div className="h-[65vh] w-full relative">
                {hasCoords ? (
                    <Map
                        ref={mapRef}
                        mapboxAccessToken={MAPBOX_TOKEN}
                        initialViewState={{
                            latitude: request.location_lat,
                            longitude: request.location_lng,
                            zoom: 13
                        }}
                        style={{width: "100%", height: "100%"}}
                        mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
                    >
                        <Marker longitude={request.location_lng} latitude={request.location_lat} anchor="bottom">
                            <div className="flex flex-col items-center">
                                <span
                                    className="bg-black text-white text-[10px] px-2 py-1 rounded-md mb-1 shadow-md">Фініш</span>
                                <div className="text-3xl">🏁</div>
                            </div>
                        </Marker>

                        {myCoords && (
                            <Marker longitude={myCoords.lng} latitude={myCoords.lat} anchor="center">
                                <div className="relative">
                                    <div
                                        className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 relative"></div>
                                    <div
                                        className="absolute top-0 left-0 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-50"></div>
                                </div>
                            </Marker>
                        )}

                        {routeGeoJSON && (
                            <Source id="route-source" type="geojson" data={routeGeoJSON}>
                                <Layer {...(transportMode === 'walking' ? walkingLayer : drivingLayer)} />
                            </Source>
                        )}
                    </Map>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">Немає
                        координат</div>
                )}

                {/* ПАНЕЛЬ НАВІГАЦІЇ */}
                <div
                    className="absolute bottom-4 left-4 right-4 bg-white p-2 rounded-2xl shadow-[0_10px_40px_-10px_#ffcdd6] border border-white flex justify-between items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['walking', 'driving', 'cycling'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setTransportMode(mode as any)}
                                className={`p-2 rounded-lg transition-all ${transportMode === mode ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                            >
                                {mode === 'walking' ? '🚶' : mode === 'driving' ? '🚗' : '🚲'}
                            </button>
                        ))}
                    </div>
                    {routeInfo ? (
                        <div className="text-right px-2">
                            <p className="text-sm font-bold text-gray-800">{routeInfo.duration} хв</p>
                            <p className="text-[10px] text-gray-500">{routeInfo.distance} км</p>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-400 px-2">Маршрут...</div>
                    )}
                    <button onClick={openGoogleMaps}
                            className="bg-blue-50 text-blue-600 p-2.5 rounded-xl text-xs font-bold border border-blue-100">
                        🚌 Google
                    </button>
                </div>
            </div>

            {/* ДЕТАЛІ */}
            <div className="px-6 py-6 space-y-6">

                {/* Таймер */}
                {isInProgress && (
                    <div
                        className="bg-black text-white p-5 rounded-3xl text-center shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">До завершення</p>
                        <div
                            className="text-3xl font-mono font-bold tracking-wider text-[#ffcdd6]">{timeLeft || "..."}</div>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-900">{request.title}</h2>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${request.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                        {request.status === 'in_progress' ? 'В роботі' : request.status}
                    </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-white shadow-[0_0_20px_#ffcdd6]">
                    <p className="text-gray-600 text-sm leading-relaxed">{request.description}</p>
                </div>

                {/* Контакт */}
                <div
                    className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-white shadow-[0_0_20px_#ffcdd6]">
                    <img
                        src={request.other_avatar || '/logo_for_reg.jpg'}
                        className="w-12 h-12 rounded-full border-[3px] border-white shadow-[0_0_10px_#ffcdd6] object-cover"
                    />
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Контакт</p>
                        <p className="font-bold text-gray-800">{request.other_name || "Користувач"}</p>
                    </div>
                    <div className="ml-auto font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg text-xs">
                        {request.price} USDT
                    </div>
                </div>
            </div>

            {/* --- НИЖНЯ ФІКСОВАНА ПАНЕЛЬ (КНОПКИ) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t border-gray-100 p-4 z-30">
                <div className="max-w-3xl mx-auto flex gap-3">

                    {/* КНОПКИ ДЛЯ НОВИХ ЗАМОВЛЕНЬ (Pending) */}
                    {isPending && (
                        <>
                            <button
                                onClick={handleDecline}
                                disabled={loadingAction}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Відхилити
                            </button>
                            <button
                                onClick={handleAccept}
                                disabled={loadingAction}
                                className="flex-[2] py-3 rounded-xl bg-black text-white font-bold shadow-lg hover:bg-gray-800 transition-colors"
                            >
                                {loadingAction ? "..." : "Прийняти"}
                            </button>
                        </>
                    )}

                    {/* КНОПКИ ДЛЯ ЗАМОВЛЕНЬ В РОБОТІ (In Progress) */}
                    {isInProgress && (
                        <>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex-1 py-3 bg-white text-black border border-gray-200 rounded-xl font-bold shadow-sm"
                            >
                                Чат
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={loadingAction}
                                className="flex-[2] py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-colors"
                            >
                                {loadingAction ? "..." : "✅ Завершити"}
                            </button>
                        </>
                    )}

                    {/* Якщо виконано або скасовано - кнопка "Назад" */}
                    {!isPending && !isInProgress && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                        >
                            Назад
                        </button>
                    )}
                </div>
            </div>

            {/*/!* ЧАТ МОДАЛКА *!/*/}
            {/*{isChatOpen && (*/}
            {/*    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center">*/}
            {/*        <div className="bg-white w-full sm:max-w-md h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">*/}
            {/*            <div className="p-4 border-b flex justify-between items-center bg-gray-50">*/}
            {/*                <h3 className="font-bold">Чат замовлення</h3>*/}
            {/*                <button onClick={() => setIsChatOpen(false)} className="text-gray-500 text-xl">✕</button>*/}
            {/*            </div>*/}
            {/*            <div className="flex-1 overflow-hidden">*/}
            {/*                <OrderChat orderId={request.order_id || request.id} />*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}

        </div>
    );
}