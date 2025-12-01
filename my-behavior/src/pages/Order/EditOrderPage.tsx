import React, {useState, useEffect, useRef} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Map, {Marker, NavigationControl, MapRef} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {supabase} from "../../lib/supabaseClient";
import {useAuth} from "../../context/AuthProvider";
import {toast} from 'react-toastify';

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

export default function EditOrderPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {orderId} = useParams();
    const mapRef = useRef<MapRef>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Поля форми
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // Координати
    const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null); // Поточні (нові)
    const [originalCoords, setOriginalCoords] = useState<{ lat: number, lng: number } | null>(null); // Минулі (старі)

    const [scenarioId, setScenarioId] = useState<number | null>(null);

    // --- НЕЗМІННІ ДАНІ (READ-ONLY) ---
    const [readOnlyInfo, setReadOnlyInfo] = useState({
        price: 0,
        status: "",
        execution_time: ""
    });
    const [timeLeft, setTimeLeft] = useState<string>("Calculating...");

    // Завантаження даних
    useEffect(() => {
        const fetchOrder = async () => {
            if (!user || !orderId) return;

            const {data, error} = await supabase
                .from('orders')
                .select(`*, location_coords::text, scenarios(title, description, price)`)
                .eq('id', orderId)
                .single();

            if (error || !data) {
                toast.error("Замовлення не знайдено");
                navigate('/MyOrders');
                return;
            }

            if (data.customer_id !== user.id) {
                toast.error("Ви не можете редагувати це замовлення");
                navigate('/MyOrders');
                return;
            }

            // Заповнюємо поля
            setTitle(data.scenarios?.title || "");
            setDescription(data.scenarios?.description || "");
            setScenarioId(data.scenario_id);

            if (data.execution_time) {
                const dt = new Date(data.execution_time);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
            }

            // Парсинг координат
            if (data.location_coords) {
                const match = data.location_coords.match(/POINT\(([^ ]+) ([^ ]+)\)/);
                if (match) {
                    const lng = parseFloat(match[1]);
                    const lat = parseFloat(match[2]);

                    // Встановлюємо і поточні, і оригінальні координати
                    setCoords({lat, lng});
                    setOriginalCoords({lat, lng});
                }
            }

            setReadOnlyInfo({
                price: data.scenarios?.price || 0,
                status: data.status,
                execution_time: data.execution_time
            });

            setLoading(false);
        };

        fetchOrder();
    }, [orderId, user, navigate]);

    // Таймер
    useEffect(() => {
        if (!readOnlyInfo.execution_time) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(readOnlyInfo.execution_time).getTime();
            const dist = target - now;

            if (dist < 0) {
                setTimeLeft("Час вийшов");
            } else {
                const days = Math.floor(dist / (1000 * 60 * 60 * 24));
                const hours = Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));

                if (days > 0) setTimeLeft(`${days}д ${hours}г ${minutes}хв`);
                else setTimeLeft(`${hours}г ${minutes}хв`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [readOnlyInfo.execution_time]);


    const handleMapClick = (e: any) => {
        const {lng, lat} = e.lngLat;
        setCoords({lat, lng});
    };

    const handleSave = async () => {
        if (!date || !time || !title || !description) {
            toast.error("Заповніть всі поля");
            return;
        }
        setSaving(true);

        try {
            const newExecutionTime = new Date(`${date}T${time}`).toISOString();

            await supabase.from('scenarios').update({title, description}).eq('id', scenarioId);

            const updates: any = {
                execution_time: newExecutionTime
            };

            if (coords) {
                updates.location_coords = `POINT(${coords.lng} ${coords.lat})`;
            }

            const {error: ordError} = await supabase
                .from('orders')
                .update(updates)
                .eq('id', orderId);

            if (ordError) throw ordError;

            toast.success("✅ Замовлення оновлено!");
            setReadOnlyInfo(prev => ({...prev, execution_time: newExecutionTime}));

            // Оновлюємо "оригінальну" точку на нову збережену
            if (coords) setOriginalCoords(coords);

            navigate('/MyOrders');

        } catch (e: any) {
            toast.error("Помилка: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return {text: "Очікує виконавця", color: "bg-yellow-100 text-yellow-700"};
            case 'paid_pending_execution':
                return {text: "Оплачено, очікує", color: "bg-purple-100 text-purple-700"};
            case 'in_progress':
                return {text: "В роботі", color: "bg-blue-100 text-blue-700"};
            case 'completed_pending_approval':
                return {text: "На перевірці", color: "bg-orange-100 text-orange-700"};
            case 'completed':
                return {text: "Виконано", color: "bg-green-100 text-green-700"};
            case 'expired':
                return {text: "Прострочено", color: "bg-red-100 text-red-700"};
            case 'cancelled':
                return {text: "Скасовано", color: "bg-gray-200 text-gray-600"};
            default:
                return {text: status, color: "bg-gray-100"};
        }
    };

    if (loading) return <div className="p-10 text-center">Завантаження...</div>;

    const statusInfo = getStatusLabel(readOnlyInfo.status);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative">

            {/* Хедер */}
            <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black transition">← Назад
                </button>
                <h1 className="text-xl font-bold">Редагування</h1>
                <div className="w-8"></div>
            </div>

            <main className="max-w-2xl mx-auto p-6 space-y-6">

                {/* Інформація (Read-Only) */}
                <div
                    className="bg-white p-6 rounded-3xl border border-white shadow-[0_0_20px_-5px_#ffcdd6] flex flex-col gap-4 relative overflow-hidden">
                    <div
                        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-300 to-purple-300"></div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Інформація про
                        замовлення</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Сума</span>
                            <span
                                className={`text-lg font-bold ${readOnlyInfo.price > 0 ? "text-green-600" : "text-pink-500"}`}>
                                {readOnlyInfo.price > 0 ? `${readOnlyInfo.price} USDT` : "Безкоштовно"}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <span className="text-xs text-gray-500 block mb-1">Таймер</span>
                            <span className="text-lg font-mono font-bold text-gray-800">{timeLeft}</span>
                        </div>
                    </div>
                    <div
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <span className="text-xs text-gray-500">Статус:</span>
                        <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${statusInfo.color}`}>{statusInfo.text}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 text-center mt-1">🔒 Ці дані не підлягають зміні</div>
                </div>

                {/* Форма */}
                <div className="bg-white p-6 rounded-3xl border border-white shadow-[0_0_20px_-5px_#ffcdd6] space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">✏️</span>
                        <h3 className="font-bold text-gray-800">Змінити деталі</h3>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Назва</label>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#ffcdd6] transition-all"/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Опис</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#ffcdd6] transition-all resize-none"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Дата</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)}
                                   className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#ffcdd6]"/>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Час</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)}
                                   className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-[#ffcdd6]"/>
                        </div>
                    </div>
                </div>

                {/* Карта */}
                <div className="bg-white p-2 rounded-3xl border border-white shadow-[0_0_20px_-5px_#ffcdd6] space-y-2">
                    <div className="px-4 pt-2 text-xs font-bold text-gray-400 uppercase">
                        Змінити місце (клікніть на карті)
                    </div>
                    <div className="h-64 w-full rounded-2xl overflow-hidden relative">
                        <Map
                            ref={mapRef}
                            mapboxAccessToken={MAPBOX_TOKEN}
                            initialViewState={{
                                latitude: coords?.lat || 50.45,
                                longitude: coords?.lng || 30.52,
                                zoom: 13
                            }}
                            style={{width: "100%", height: "100%"}}
                            mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
                            onClick={handleMapClick}
                            cursor="crosshair"
                        >
                            <NavigationControl/>

                            {/* 1. СТАРА ТОЧКА (Сіра, напівпрозора) */}
                            {originalCoords && (
                                <Marker
                                    longitude={originalCoords.lng}
                                    latitude={originalCoords.lat}
                                    anchor="bottom"
                                >
                                    <div className="flex flex-col items-center opacity-50 grayscale filter">
                                        <span
                                            className="bg-gray-500 text-white text-[8px] px-1 rounded shadow">Було</span>
                                        <div className="text-2xl">📍</div>
                                    </div>
                                </Marker>
                            )}

                            {/* 2. НОВА ТОЧКА (Червона, активна) */}
                            {coords && (
                                <Marker
                                    longitude={coords.lng}
                                    latitude={coords.lat}
                                    anchor="bottom"
                                    color="#ff4081"
                                >
                                    {/* Можна додати анімацію стрибка для нової точки */}
                                    <div className="animate-bounce">
                                        <svg height="30px" viewBox="0 0 24 24" width="30px" fill="#ff4081">
                                            <path
                                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                        </svg>
                                    </div>
                                </Marker>
                            )}
                        </Map>
                    </div>

                    {/* Легенда та статус */}
                    <div className="flex justify-between items-center px-2">
                        <div className="flex gap-3 text-[10px] text-gray-500">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full opacity-50"></div>
                                Минула
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-[#ff4081] rounded-full"></div>
                                Нова
                            </div>
                        </div>
                        {coords && (
                            <div className="text-xs text-green-600 font-bold">
                                Точку змінено!
                            </div>
                        )}
                    </div>
                </div>

                {/* Кнопка Зберегти */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-4 rounded-2xl bg-black text-white font-bold text-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] hover:bg-gray-800 active:scale-[0.98] transition-all"
                >
                    {saving ? "Збереження..." : "Зберегти зміни"}
                </button>

            </main>
        </div>
    );
}