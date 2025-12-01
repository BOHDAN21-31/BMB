import React, {useState, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {supabase} from "../../lib/supabaseClient";
import {useAuth} from "../../context/AuthProvider";
import Map, {Marker, NavigationControl} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {ethers} from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const MAPBOX_TOKEN = "pk.eyJ1IjoiYnV5bXliaWhhdmlvciIsImEiOiJjbWM4MzU3cDQxZGJ0MnFzM3NnOHhnaWM4In0.wShhGG9EvmIVxcHjBHImXw";

export const USDT_CONTRACT_ADDRESS = import.meta.env.VITE_USDT_CONTRACT_ADDRESS as string;
export const ESCROW_WALLET_ADDRESS = import.meta.env.VITE_ESCROW_WALLET_ADDRESS as string;

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)"
];

export default function CreateOrderPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const locationHook = useLocation();

    const performerId = locationHook.state?.performerId;

    const [performerName, setPerformerName] = useState("Користувач");
    const [performerAvatar, setPerformerAvatar] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Поля форми
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number | "">("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Константи дат
    const today = new Date().toISOString().split("T")[0];
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const maxDate = nextYearDate.toISOString().split("T")[0];

    useEffect(() => {
        if (performerId) {
            supabase
                .from("profiles")
                .select("display_name, avatar_url")
                .eq("id", performerId)
                .single()
                .then(({data}) => {
                    if (data) {
                        setPerformerName(data.display_name || "Користувач");
                        setPerformerAvatar(data.avatar_url);
                    }
                });
        }
    }, [performerId]);

    // --- ВАЛІДАЦІЯ ДАТИ ТА ЧАСУ ---
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            setDate("");
            return;
        }
        if (val < today) {
            alert("Не можна обрати минулу дату!");
            setDate(today);
        } else if (val > maxDate) {
            alert("Дата не може бути більше ніж через рік!");
            setDate(maxDate);
        } else {
            setDate(val);
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            setTime("");
            return;
        }
        if (date === today) {
            const now = new Date();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHours}:${currentMinutes}`;

            if (val < currentTime) {
                alert("Цей час вже минув!");
                setTime(currentTime);
                return;
            }
        }
        setTime(val);
    };

    const onMapClick = (e: any) => {
        const {lng, lat} = e.lngLat;
        setSelectedCoords({lng, lat});
    };

    const confirmLocation = () => {
        setIsMapOpen(false);
    };

    // --- ЛОГІКА ОПЛАТИ ---
    const processPayment = async (amount: number): Promise<string | null> => {
        if (!window.ethereum) {
            alert("Будь ласка, встановіть MetaMask!");
            return null;
        }

        try {
            setStatusMessage("Відкриваємо MetaMask...");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);

            // USDT в BSC має 18 знаків після коми
            const amountInWei = ethers.parseUnits(amount.toString(), 18);

            setStatusMessage("Підтвердіть транзакцію в гаманці...");

            // Відправляємо гроші на ГАМАНЕЦЬ ПЛАТФОРМИ (ESCROW)
            // Вони будуть лежати там, поки бекенд не розподілить їх (90/5/5)
            const tx = await usdtContract.transfer(ESCROW_WALLET_ADDRESS, amountInWei);

            setStatusMessage("Транзакція відправлена. Чекаємо підтвердження...");
            await tx.wait();

            console.log("Транзакція успішна:", tx.hash);
            return tx.hash;

        } catch (error: any) {
            console.error("Payment Error:", error);
            alert("Помилка оплати: " + (error.reason || error.message));
            return null;
        }
    };

    // --- ВІДПРАВКА ЗАМОВЛЕННЯ ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !performerId) return;
        if (!selectedCoords) {
            alert("Будь ласка, оберіть місце на карті!");
            return;
        }
        if (price === "" || Number(price) < 0) {
            alert("Вкажіть коректну суму (0 для безкоштовно).");
            return;
        }
        if (!date || !time) {
            alert("Вкажіть дату та час.");
            return;
        }

        setLoading(true);

        try {
            const numericPrice = Number(price);
            let orderStatus = 'pending_execution';
            let txHash = null;

            // 1. ОПЛАТА
            if (numericPrice > 0) {
                txHash = await processPayment(numericPrice);

                if (!txHash) {
                    setLoading(false);
                    setStatusMessage("");
                    return;
                }
                orderStatus = 'paid_pending_execution';
            }

            // 2. ОТРИМУЄМО РЕФЕРЕРА (хто привів мене?)
            // Припускаємо, що в профілі є поле invited_by
            const {data: myProfile} = await supabase
                .from('profiles')
                .select('invited_by')
                .eq('id', user.id)
                .single();

            const referrerId = myProfile?.invited_by || null;

            // 3. СТВОРЕННЯ СЦЕНАРІЮ
            setStatusMessage("Створюємо замовлення...");
            const {data: scenarioData, error: scenarioError} = await supabase
                .from("scenarios")
                .insert({
                    creator_id: user.id,
                    title: title,
                    description: description,
                    price: numericPrice,
                })
                .select()
                .single();

            if (scenarioError) throw scenarioError;

            // 4. СТВОРЕННЯ ЗАМОВЛЕННЯ (з даними про виплату)
            const executionDateTime = new Date(`${date}T${time}`).toISOString();

            const {error: orderError} = await supabase
                .from("orders")
                .insert({
                    scenario_id: scenarioData.id,
                    customer_id: user.id,
                    performer_id: performerId,
                    status: orderStatus,
                    execution_time: executionDateTime,
                    location_coords: `POINT(${selectedCoords.lng} ${selectedCoords.lat})`,

                    // Зберігаємо важливі дані для бекенду:
                    transaction_hash: txHash,
                    payout_details: {
                        performer_amount: numericPrice * 0.90, // 90%
                        platform_amount: numericPrice * 0.05,  // 5%
                        referrer_amount: numericPrice * 0.05,  // 5%
                        referrer_id: referrerId
                    }
                });

            if (orderError) throw orderError;

            alert(numericPrice > 0
                ? "✅ Оплата успішна! Кошти заморожено. Замовлення надіслано."
                : "✅ Замовлення надіслано (безкоштовно)!"
            );

            navigate("/MapPages");

        } catch (error: any) {
            console.error("Error:", error);
            alert("Помилка: " + error.message);
        } finally {
            setLoading(false);
            setStatusMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 relative">

            {/* --- HEADER --- */}
            <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black transition">
                        ← Назад
                    </button>
                    <h1 className="text-xl font-bold">Оформлення</h1>
                    <div className="w-8"></div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-2xl mx-auto p-6">

                {/* Інфо про виконавця */}
                <div
                    className="bg-white p-4 rounded-2xl border border-white mb-6 flex items-center gap-4
                    shadow-[0_0_20px_rgba(255,205,214,0.6)]"
                >
                    <div
                        className="rounded-full shadow-[0_0_15px_#ffcdd6] border-[3px] border-white overflow-hidden w-14 h-14 min-w-[56px]">
                        <img
                            src={performerAvatar || "/logo_for_reg.jpg"}
                            alt={performerName}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Виконавець</p>
                        <h2 className="font-bold text-lg text-gray-900">{performerName}</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Назва */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Назва</label>
                        <input
                            type="text"
                            required
                            placeholder="Коротко про завдання..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-gray-800
                                       focus:outline-none focus:border-[#ffcdd6] focus:ring-4 focus:ring-[#ffcdd6]/30
                                       shadow-[0_0_15px_rgba(255,205,214,0.4)] transition-all"
                        />
                    </div>

                    {/* Опис */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Опис</label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Опишіть деталі сценарію..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-gray-800
                                       focus:outline-none focus:border-[#ffcdd6] focus:ring-4 focus:ring-[#ffcdd6]/30
                                       shadow-[0_0_15px_rgba(255,205,214,0.4)] transition-all resize-none"
                        />
                    </div>

                    {/* Добровільний внесок */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Добровільний внесок (USDT)</label>
                        <div className="relative">
                            <input
                                type="number"
                                required
                                placeholder="0.00"
                                min="0" // Дозволяє 0
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-white text-gray-800
                                           focus:outline-none focus:border-[#ffcdd6] focus:ring-4 focus:ring-[#ffcdd6]/30
                                           shadow-[0_0_15px_rgba(255,205,214,0.4)] transition-all"
                            />
                            <span
                                className="absolute right-5 top-4 text-green-600 font-bold text-sm">USDT (BEP20)</span>
                        </div>
                        <div className="flex justify-between items-center ml-1 mt-1">
                            <p className="text-[10px] text-gray-400">
                                * 0 = Безкоштовно. Кошти &gt; 0 заморожуються.
                            </p>
                        </div>
                    </div>

                    {/* Дата і Час */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Дата</label>
                            <input
                                type="date"
                                required
                                min={today}
                                max={maxDate}
                                value={date}
                                onChange={handleDateChange}
                                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-800
                                           focus:outline-none focus:border-[#ffcdd6] focus:ring-4 focus:ring-[#ffcdd6]/30
                                           shadow-[0_0_15px_rgba(255,205,214,0.4)] transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Час</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={handleTimeChange}
                                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-white text-gray-800
                                           focus:outline-none focus:border-[#ffcdd6] focus:ring-4 focus:ring-[#ffcdd6]/30
                                           shadow-[0_0_15px_rgba(255,205,214,0.4)] transition-all"
                            />
                        </div>
                    </div>

                    {/* Кнопка вибору місця */}
                    <div className="pt-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1 block mb-2">Місце зустрічі</label>
                        <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className={`w-full py-4 px-5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 transition-all 
                                shadow-[0_0_15px_rgba(255,205,214,0.3)] 
                                ${selectedCoords
                                ? "border-green-400 bg-green-50 text-green-700 shadow-none"
                                : "border-gray-300 text-gray-500 hover:border-[#ffcdd6] hover:bg-[#fff0f5]"
                            }
                            `}
                        >
                            {selectedCoords ? (
                                <>
                                    <span>📍 Місце обрано</span>
                                    <span
                                        className="text-xs">({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Обрати місце на мапі
                                </>
                            )}
                        </button>
                    </div>

                    {/* Кнопка Надіслати */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-4 rounded-full text-lg
                                       shadow-[0_10px_30px_-5px_rgba(255,205,214,0.6)]
                                       hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span>{statusMessage || "Обробка..."}</span>
                            ) : (
                                <>
                                    Надіслати сценарій
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>

            {/* --- МОДАЛЬНЕ ВІКНО З КАРТОЮ --- */}
            {isMapOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div
                        className="bg-white w-full h-[80vh] max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">

                        <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center z-10">
                            <h3 className="font-bold text-lg">Оберіть точку на карті</h3>
                            <button
                                onClick={() => setIsMapOpen(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-1 relative">
                            <Map
                                mapboxAccessToken={MAPBOX_TOKEN}
                                initialViewState={{
                                    latitude: 50.4501,
                                    longitude: 30.5234,
                                    zoom: 11
                                }}
                                style={{width: "100%", height: "100%"}}
                                mapStyle="mapbox://styles/buymybihavior/cmhl1ri9c004201sj1aaa81q9"
                                onClick={onMapClick}
                                cursor="crosshair"
                            >
                                <NavigationControl position="bottom-right"/>

                                {selectedCoords && (
                                    <Marker
                                        longitude={selectedCoords.lng}
                                        latitude={selectedCoords.lat}
                                        anchor="bottom"
                                        color="#ffcdd6"
                                    />
                                )}
                            </Map>

                            <div
                                className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md text-xs font-medium pointer-events-none">
                                Тапніть по карті, щоб поставити маркер
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={confirmLocation}
                                disabled={!selectedCoords}
                                className="w-full bg-black text-white font-bold py-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {selectedCoords ? "Підтвердити це місце" : "Спочатку оберіть місце"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}