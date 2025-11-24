import React, {useRef, useState, useEffect, useCallback} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import type {Profile, Scenario} from "../types/database.types";

const ROLES = [
    "Актор",
    "Музикант",
    "Авантюрист",
    "Платонічний Ескорт",
    "Хейтер",
    "Танцівник",
    "Бодібілдер-охоронець",
    "Філософ",
    "Провидець на виїзді",
    "Репортер",
    "Пранкер",
    "Лицедій (імпровізатор)",
    "Артист дії",
    "Інфлюенсер",
    "Інше"
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
                setRole(data.role || "");
                setDescription(data.bio || "");
                setIsLocationPublic(data.is_location_public || false);
            }
        } catch (error: any) {
            alert("Помилка завантаження профілю: " + error.message);
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
            if (data) {
                setMyScenarios(data as Scenario[]);
            }
        } catch (error: any) {
            alert("Помилка завантаження сценаріїв: " + error.message);
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
                updated_at: new Date().toISOString(),
            };

            const {error} = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);
            if (error) {
                throw error;
            }

            alert("✅ Профіль збережено!");

        } catch (error: any) {
            alert("Помилка оновлення: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        try {
            setLoading(true);
            const {error: uploadError} = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const {data} = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            const publicUrl = data.publicUrl;

            setAvatarUrl(publicUrl);

            const {error: updateError} = await supabase
                .from("profiles")
                .update({avatar_url: publicUrl})
                .eq("id", user.id);

            if (updateError) throw updateError;
        } catch (error: any) {
            alert("Помилка завантаження фото: " + error.message);
        } finally {
            setLoading(false);
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

            const {data, error} = await supabase
                .from("scenarios")
                .insert(newScenario)
                .select();
            if (error) throw error;

            if (data) {
                setMyScenarios([...myScenarios, data[0] as Scenario]);
            }
            alert(`💾 Сценарій збережено!`);
            setScenarioTitle("");
            setScenarioText("");
            setScenarioPrice(0);
        } catch (error: any) {
            alert("Помилка збереження сценарію: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteScenario = async (scenarioId: number) => {
        if (!confirm("Ви впевнені, що хочете видалити цей сценарій?")) return;

        try {
            const {error} = await supabase
                .from("scenarios")
                .delete()
                .eq("id", scenarioId);

            if (error) throw error;

            // Оновлюємо локальний стан, прибираючи видалений елемент
            setMyScenarios((prev) => prev.filter((item) => item.id !== scenarioId));

        } catch (error: any) {
            alert("Помилка видалення: " + error.message);
        }
    };

    const handleGeoToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked;
        setIsLocationPublic(enabled);
        if (!user) return;

        let updates: Partial<Profile> = {
            is_location_public: enabled,
        };

        if (enabled) {
            try {
                const position = await new Promise<GeolocationPosition>(
                    (resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    }
                );
                const {longitude, latitude} = position.coords;
                updates.location = `POINT(${longitude} ${latitude})`;
            } catch (error) {
                alert("Не вдалось отримати геолокацію.");
                setIsLocationPublic(false);
                return;
            }
        } else {
            updates.location = undefined;
        }

        try {
            const {error} = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);
            if (error) throw error;
        } catch (error: any) {
            alert("Помилка оновлення геолокації: " + error.message);
        }
    };

    if (loading && !displayName) return <div>Завантаження профілю...</div>;

    return (
        <div className="profile-container max-w-3xl mx-auto p-6 space-y-6">

            <div className="flex flex-col items-center">
                <div
                    className={`
                        flex flex-col items-center justify-center 
                        w-[180px] h-[180px] rounded-full 
                        bg-white gap-2 text-slate-500 
                        transition-all duration-300 ease-linear overflow-hidden
                        ${avatarUrl
                        ? "border-[4px] border-[#ffcdd6] shadow-lg border-solid"
                        : "border-2 border-dashed border-slate-300"
                    }
                    `}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-sm text-gray-600">
                            Додати фото
                        </div>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <div
                className="w-full max-w-[600px] mx-auto mt-3 mb-4 bg-white border border-white rounded-2xl p-4 shadow-[0_14px_28px_rgba(255,131,176,0.18),0_2px_8px_rgba(0,0,0,0.06)]">
                <h2 className="text-[16px] font-bold text-black mt-[2px] mb-[10px]">
                    Налаштування
                </h2>
                <div
                    className="flex items-center justify-between py-[10px] px-[2px] first:border-t-0 border-t border-dashed border-[#ffe2ea]">
                    <span>Геолокація</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isLocationPublic}
                            onChange={handleGeoToggle}
                        />
                        <div
                            className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-400 transition-all"></div>
                        <div
                            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                    </label>
                </div>
            </div>

            <div
                className="flex flex-col gap-5 bg-white max-w-[600px] w-full my-4 mx-auto p-8 rounded-2xl border border-gray-300 shadow-[0_8px_32px_#0000000f]">
                <input
                    placeholder="Ім’я або псевдонім"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                >
                    <option value="">Оберіть роль</option>
                    {ROLES.map((roleName) => (
                        <option key={roleName} value={roleName}>
                            {roleName}
                        </option>
                    ))}
                </select>

                <textarea
                    placeholder="Опиши свої здібності..."
                    value={bio}
                    onChange={(e) => setDescription(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />
                <input
                    placeholder="BSC (BEP-20) гаманець або MetaMask"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014]">
                        {loading ? "Збереження..." : "💾 Зберегти профіль"}
                    </button>
                </div>
            </div>

            <div
                className="flex flex-col gap-5 bg-white max-w-[600px] w-full my-4 mx-auto p-8 rounded-2xl border border-gray-300 shadow-[0_8px_32px_#0000000f]">
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
                    className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014]">
                    {loading ? "Збереження..." : "Зберегти сценарій"}
                </button>
            </div>

            <div
                className="max-w-[600px] w-full my-8 mx-auto p-8 bg-white rounded-2xl border border-white shadow-[0_18px_40px_#ff83b02e,0_4px_10px_#0000000f]">
                <h2 className="text-lg font-semibold mb-2">📝 Твої сценарії</h2>
                {myScenarios.length === 0 ? (
                    <>
                        <p>📝 Немає сценаріїв</p>
                        <p className="text-sm text-gray-500">
                            Створи перший сценарій у формі вище
                        </p>
                    </>
                ) : (
                    <ul className="space-y-3">
                        {myScenarios.map((scenario) => (
                            <li
                                key={scenario.id}
                                className="flex justify-between items-start p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1 pr-2">
                                    <h3 className="font-bold text-gray-900">{scenario.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{scenario.description}</p>
                                    <span
                                        className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                                        {scenario.price} USDT
                                    </span>
                                </div>

                                <button
                                    onClick={() => handleDeleteScenario(scenario.id)}
                                    title="Видалити сценарій"
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                         strokeLinejoin="round">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
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