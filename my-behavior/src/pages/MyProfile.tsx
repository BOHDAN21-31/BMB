import React, {useRef, useState, useEffect, useCallback} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {MetaMaskSDK} from "@metamask/sdk";
import type {Profile, Scenario} from "../types/database.types";

const MMSDK = new MetaMaskSDK({
    dappMetadata: {
        name: "Buy My Behavior",
        url: window.location.href,
    },
    checkInstallationImmediately: false,
});

const ROLES = [
    "Актор", "Музикант", "Авантюрист", "Платонічний Ескорт",
    "Хейтер", "Танцівник", "Бодібілдер-охоронець", "Філософ",
    "Провидець на виїзді", "Репортер", "Пранкер",
    "Лицедій (імпровізатор)", "Артист дії", "Інфлюенсер", "Інше"
];

export default function ProfilePage() {
    const {user} = useAuth();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [loading, setLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState("");
    const [role, setRole] = useState("");
    const [bio, setDescription] = useState("");
    const [wallet, setWallet] = useState("");
    const [isLocationPublic, setIsLocationPublic] = useState(false);

    const [scenarioText, setScenarioText] = useState("");
    const [scenarioPrice, setScenarioPrice] = useState<number>(0);
    const [scenarioTitle, setScenarioTitle] = useState("");
    const [myScenarios, setMyScenarios] = useState<Scenario[]>([]);

    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);
    const [isCustomRole, setIsCustomRole] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const {outcome} = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setDeferredPrompt(null);
    };

    const handleConnectMetaMask = async () => {
        if (!user) return;

        try {
            setIsMetaMaskConnecting(true);
            console.log("Викликаємо MetaMask...");
            const accounts = await MMSDK.connect();
            // @ts-ignore
            const address = accounts?.[0];

            if (address) {
                console.log("Гаманець отримано:", address);
                setWallet(address);

                const {error} = await supabase
                    .from("profiles")
                    .update({wallet: address})
                    .eq("id", user.id);

                if (error) throw error;
                alert(`✅ Гаманець підв'язано: ${address.slice(0, 6)}...`);
            }
        } catch (err: any) {
            console.error("MetaMask error:", err);
            alert("Не вдалося підключити. Спробуйте ще раз.");
        } finally {
            setIsMetaMaskConnecting(false);
        }
    };

    const getProfile = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const {data, error} = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) throw error;
            if (data) {
                setDisplayName(data.display_name || "");
                setAvatarUrl(data.avatar_url || null);

                // Логіка ролі
                const loadedRole = data.role || "";
                setRole(loadedRole);
                if (loadedRole && !ROLES.includes(loadedRole)) {
                    setIsCustomRole(true);
                } else {
                    setIsCustomRole(false);
                }

                setDescription(data.bio || "");
                setIsLocationPublic(data.is_location_public || false);
                setWallet(data.wallet || "");
            }
        } catch (error: any) {
            console.error("Помилка профілю:", error.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getMyScenarios = useCallback(async () => {
        if (!user) return;
        try {
            const {data, error} = await supabase
                .from("scenarios")
                .select("*")
                .eq("creator_id", user.id);

            if (error) throw error;
            if (data) setMyScenarios(data as Scenario[]);
        } catch (error: any) {
            console.error("Помилка сценаріїв:", error.message);
        }
    }, [user]);

    useEffect(() => {
        getProfile();
        getMyScenarios();
    }, [getProfile, getMyScenarios]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updates = {
                display_name: displayName,
                role: role,
                bio: bio,
                wallet: wallet,
                updated_at: new Date().toISOString(),
            };

            const {error} = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;
            alert("✅ Профіль збережено!");
        } catch (error: any) {
            alert("Помилка: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !user) return;
        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        try {
            setLoading(true);
            const {error: uploadError} = await supabase.storage.from("avatars").upload(filePath, file);
            if (uploadError) throw uploadError;

            const {data} = supabase.storage.from("avatars").getPublicUrl(filePath);
            const publicUrl = data.publicUrl;
            setAvatarUrl(publicUrl);

            await supabase.from("profiles").update({avatar_url: publicUrl}).eq("id", user.id);
        } catch (error: any) {
            alert("Помилка фото: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGeoToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked;
        setIsLocationPublic(enabled);
        if (!user) return;

        let updates: any = {is_location_public: enabled};

        if (enabled) {
            try {
                // Додаємо опції для кращого пошуку
                const options = {
                    enableHighAccuracy: true, // Вимагати точний GPS
                    timeout: 15000,           // Чекати до 15 секунд (було замало)
                    maximumAge: 0             // Не використовувати старий кеш
                };

                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, options);
                });

                const {longitude, latitude} = position.coords;
                console.log("Отримано координати:", latitude, longitude); // Для дебагу

                updates.location = `POINT(${longitude} ${latitude})`;
            } catch (error: any) {
                console.error("Geo Error:", error);

                // Більш зрозуміле повідомлення про помилку
                let msg = "Не вдалось отримати геолокацію.";
                if (error.code === 1) msg = "Доступ до геолокації заборонено. Дозвольте у налаштуваннях.";
                if (error.code === 2) msg = "Позиція недоступна (перевірте GPS/Wi-Fi).";
                if (error.code === 3) msg = "Час очікування геолокації вийшов.";

                alert(msg);
                setIsLocationPublic(false); // Вимикаємо перемикач назад
                return;
            }
        } else {
            updates.location = null;
        }

        try {
            const {error} = await supabase.from("profiles").update(updates).eq("id", user.id);
            if (error) throw error;
        } catch (error: any) {
            alert("Помилка збереження: " + error.message);
            setIsLocationPublic(false);
        }
    };

    const handleSaveScenario = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const newScenario = {
                creator_id: user.id,
                title: scenarioTitle,
                description: scenarioText,
                price: scenarioPrice,
            };
            const {data, error} = await supabase.from("scenarios").insert(newScenario).select();
            if (error) throw error;
            if (data) setMyScenarios([...myScenarios, data[0] as Scenario]);

            alert(`💾 Сценарій збережено!`);
            setScenarioTitle("");
            setScenarioText("");
            setScenarioPrice(0);
        } catch (error: any) {
            alert("Помилка: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScenario = async (scenarioId: number) => {
        if (!confirm("Видалити сценарій?")) return;
        try {
            const {error} = await supabase.from("scenarios").delete().eq("id", scenarioId);
            if (error) throw error;
            setMyScenarios((prev) => prev.filter((item) => item.id !== scenarioId));
        } catch (error: any) {
            alert("Помилка видалення: " + error.message);
        }
    };

    if (loading && !displayName) return <div className="p-10 text-center">Завантаження профілю...</div>;

    const isWalletConnected = !!wallet && wallet.length > 0;

    return (
        <div className="profile-container max-w-3xl mx-auto p-6 space-y-6 pb-20">

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-[5px]">Профіль</h1>

            {deferredPrompt && (
                <button
                    onClick={handleInstallClick}
                    className="w-full max-w-[600px] mx-auto flex items-center gap-4 bg-white border border-white p-4 rounded-2xl transition-all cursor-pointer text-left shadow-[0_20px_40px_-12px_#ffcdd6]"
                >
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                        📲
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-sm">Встановити додаток</h3>
                        <p className="text-xs text-gray-500">Додати на головний екран</p>
                    </div>
                </button>
            )}

            <div className="flex flex-col items-center mt-4">
                <div
                    className={`
                        flex flex-col items-center justify-center 
                        w-[180px] h-[180px] rounded-full 
                        bg-white gap-2 text-slate-500 
                        transition-all duration-300 ease-linear overflow-hidden cursor-pointer
                        ${avatarUrl
                        /* --- НОВІ СТИЛІ ДЛЯ АВАТАРА: БІЛИЙ БОРДЕР + РОЖЕВА ТІНЬ --- */
                        ? "border-[5px] border-white shadow-[0_15px_35px_#ffcdd6]"
                        : "border-2 border-dashed border-slate-300"
                    }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                    ) : (
                        <div className="text-center text-sm text-gray-600">Додати фото</div>
                    )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>

                <div className="flex items-center justify-center gap-2 mt-4 mb-2">
                    <div className="flex text-yellow-400">★★★★★</div>
                    <span className="font-bold text-sm text-gray-800">10.0 (0 оцінок)</span>
                </div>
            </div>

            {/* --- БЛОК НАЛАШТУВАННЯ (з рожевою тінню) --- */}
            <div
                className="w-full max-w-[600px] mx-auto mt-3 mb-4 bg-white border border-white rounded-2xl p-4 shadow-[0_20px_40px_-12px_#ffcdd6]">
                <h2 className="text-[16px] font-bold text-black mt-[2px] mb-[10px]">Налаштування</h2>
                <div
                    className="flex items-center justify-between py-[10px] px-[2px] first:border-t-0 border-t border-dashed border-[#ffe2ea]">
                    <span>Геолокація</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isLocationPublic}
                               onChange={handleGeoToggle}/>
                        <div
                            className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-400 transition-all"></div>
                        <div
                            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                    </label>
                </div>
            </div>

            {/* --- ОСНОВНА ФОРМА (з рожевою тінню) --- */}
            <div
                className="flex flex-col gap-5 bg-white max-w-[600px] w-full my-4 mx-auto p-8 rounded-2xl border border-white shadow-[0_20px_40px_-12px_#ffcdd6]">
                <input
                    placeholder="Ім’я або псевдонім"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />

                <select
                    value={isCustomRole ? "Інше" : role}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Інше") {
                            setIsCustomRole(true);
                            setRole("");
                        } else {
                            setIsCustomRole(false);
                            setRole(val);
                        }
                    }}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear appearance-none"
                >
                    <option value="">Оберіть роль</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>

                {isCustomRole && (
                    <input
                        placeholder="Введіть вашу власну роль"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-5 py-4 rounded-lg border-[1.5px] border-[#ffcdd6] text-base bg-white outline-none transition-all duration-200 ease-linear animate-in fade-in slide-in-from-top-2"
                        autoFocus
                    />
                )}

                <textarea
                    placeholder="Опиши свої здібності..."
                    value={bio}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />

                <input
                    placeholder="Гаманець (підв'яжіть через кнопку нижче)"
                    value={wallet}
                    readOnly
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-gray-50 text-gray-500 outline-none"
                />

                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="w-full bg-[#ffcdd6] text-[#0e0e0e] px-3 py-3 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-md hover:brightness-95 transition-all"
                    >
                        {loading ? "Збереження..." : "💾 Зберегти профіль"}
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <button
                            className="flex-1 bg-gray-100 text-gray-500 px-3 py-3 border border-gray-200 rounded-full font-bold cursor-not-allowed shadow-sm"
                            disabled
                        >
                            KYC (Скоро)
                        </button>

                        <button
                            type="button"
                            onClick={handleConnectMetaMask}
                            disabled={isMetaMaskConnecting || isWalletConnected}
                            className={`
                                flex-1 px-3 py-3 border rounded-full font-bold cursor-pointer shadow-md transition-all
                                ${isWalletConnected
                                ? "bg-green-100 text-green-800 border-green-200 cursor-default"
                                : "bg-[#ffcdd6] text-[#0e0e0e] border-[rgba(0,0,0,0.06)] hover:brightness-95"
                            }
                            `}
                        >
                            {isMetaMaskConnecting
                                ? "З'єднання..."
                                : isWalletConnected
                                    ? `🦊 ${wallet.slice(0, 6)}...${wallet.slice(-4)}`
                                    : "🦊 Підв'язати MetaMask"
                            }
                        </button>
                    </div>
                </div>
            </div>

            {/* --- БЛОК СТВОРЕННЯ СЦЕНАРІЮ (з рожевою тінню) --- */}
            <div
                className="flex flex-col gap-5 bg-white max-w-[600px] w-full my-4 mx-auto p-8 rounded-2xl border border-white shadow-[0_20px_40px_-12px_#ffcdd6]">
                <h2 className="text-2xl font-bold my-3 mx-0">Створити сценарій</h2>
                <input
                    placeholder="Назва сценарію"
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />
                <textarea
                    placeholder="Опиши сценарій"
                    value={scenarioText}
                    onChange={(e) => setScenarioText(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />
                <input
                    type="number"
                    placeholder="Ціна в USDT"
                    value={scenarioPrice}
                    onChange={(e) => setScenarioPrice(parseFloat(e.target.value))}
                    className="px-5 py-4 pr-10 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear w-full"
                />
                <button
                    onClick={handleSaveScenario}
                    disabled={loading}
                    className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-3 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-md hover:brightness-95 transition-all"
                >
                    {loading ? "Збереження..." : "Зберегти сценарій"}
                </button>
            </div>

            {/* --- БЛОК СПИСКУ СЦЕНАРІЇВ (з рожевою тінню) --- */}
            <div
                className="max-w-[600px] w-full my-8 mx-auto p-8 bg-white rounded-2xl border border-white shadow-[0_20px_40px_-12px_#ffcdd6]">
                <h2 className="text-lg font-semibold mb-4">📝 Твої сценарії</h2>
                {myScenarios.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        <p>Ще немає сценаріїв</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {myScenarios.map((scenario) => (
                            <li
                                key={scenario.id}
                                className="flex justify-between items-start p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all"
                            >
                                <div className="flex-1 pr-3">
                                    <h3 className="font-bold text-gray-900">{scenario.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{scenario.description}</p>
                                    <span
                                        className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md mt-2 inline-block border border-green-200">
                                        {scenario.price} USDT
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteScenario(scenario.id)}
                                    title="Видалити"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path
                                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        <line x1="10" y1="11" x2="10" y2="17"></line>
                                        <line x1="14" y1="11" x2="14" y2="17"></line>
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}