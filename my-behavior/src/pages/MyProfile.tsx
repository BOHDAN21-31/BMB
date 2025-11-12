import React, {useRef, useState} from "react";

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [avatar, setAvatar] = useState<string | null>(null);
    const [geoEnabled, setGeoEnabled] = useState(true);
    const [pushEnabled, setPushEnabled] = useState(false);
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [description, setDescription] = useState("");
    const [wallet, setWallet] = useState("");
    const [scenarioText, setScenarioText] = useState("");
    const [scenarioPrice, setScenarioPrice] = useState<number | undefined>(undefined);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setAvatar(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        alert("✅ Профіль збережено!");
    };

    const handleSaveScenario = () => {
        alert(`💾 Сценарій збережено: ${scenarioText} (${scenarioPrice} USDT)`);
    };

    return (
        <div className="profile-container max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-center">Профіль</h1>

            <section className="flex flex-col items-center bg-gray-100 rounded-2xl p-4">
                <button
                    type="button"
                    aria-label="Додати іконку на головний екран"
                    className="flex items-center gap-2 bg-gray-200 border border-gray-300 rounded-xl px-4 py-2 font-semibold hover:bg-gray-300 transition"
                >
                    <img
                        src="/icons/icon-192.png"
                        alt="BMB"
                        className="w-6 h-6 rounded-md"
                    />
                    <span>Додати іконку на головний екран</span>
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                    Якщо системний діалог не з’явився — це нормально. Спробуйте ще раз або
                    відкрийте сайт напряму у браузері.
                </p>
            </section>

            <div className="flex flex-col items-center">
                <div
                    className="flex flex-col items-center justify-center w-[180px] h-[180px] rounded-full border-2 border-dashed border-slate-300 bg-white gap-2 text-slate-500 transition-all duration-300 ease-linear overflow-hidden"
                    onClick={handleAvatarClick}
                >
                    {avatar ? (
                        <img
                            src={avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="text-center text-sm text-gray-600">
                            <svg
                                className="w-12 h-12 mx-auto mb-1 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.2"
                                viewBox="0 0 24 24"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
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

            <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex">
                    {Array.from({length: 10}).map((_, i) => (
                        <svg
                            key={i}
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="#f5c542"
                            stroke="#f5c542"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9 12 2"/>
                        </svg>
                    ))}
                </div>
                <span className="text-gray-500 text-sm">0 / 10 · 0 оцінок</span>
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
                            onChange={(e) => e.target.checked}
                        />
                        <div
                            className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-400 transition-all"></div>
                        <div
                            className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-full"></div>
                    </label>
                </div>

                <div
                    className="flex items-center justify-between py-[10px] px-[2px] border-t border-dashed border-[#ffe2ea]">
                    <span>Пуш-сповіщення</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            onChange={(e) => e.target.checked}
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"

                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear">
                    <option value="">Оберіть роль</option>
                    <option>Актор</option>
                    <option>Музикант</option>
                    <option>Авантюрист</option>
                    <option>Платонічний Ескорт</option>
                    <option>Хейтер</option>
                    <option>Танцівник</option>
                    <option>Бодібілдер-охоронець</option>
                    <option>Філософ</option>
                    <option>Провидець на виїзді</option>
                    <option>Репортер</option>
                    <option>Пранкер</option>
                    <option>Лицедій (імпровізатор)</option>
                    <option>Артист дії</option>
                    <option>Інфлюенсер</option>
                    <option>Інше</option>
                </select>
                <textarea
                    placeholder="Опиши свої здібності..."
                    value={description}
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
                        className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014]">
                        🦊 Підключити MetaMask
                    </button>
                    <button
                        className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014]">
                        🛡 Пройти KYC
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014">
                        💾 Зберегти профіль
                    </button>
                </div>
            </div>

            <div
                className="flex flex-col gap-5 bg-white max-w-[600px] w-full my-4 mx-auto p-8 rounded-2xl border border-gray-300 shadow-[0_8px_32px_#0000000f]">
                <h2 className="text-2xl font-bold my-3 mx-0">Створити сценарій</h2>
                <textarea
                    placeholder="Опиши сценарій"
                    value={scenarioText}
                    onChange={(e) => setScenarioText(e.target.value)}
                    className="px-5 py-4 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear"

                />
                <input
                    type="number"
                    placeholder="Ціна в USDT"
                    className="px-5 py-4 pr-10 rounded-lg border-[1.5px] border-gray-300 text-base bg-white outline-none transition-all duration-200 ease-linear w-full"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>

                <button
                    onClick={handleSaveScenario}
                    className="bg-[#ffcdd6] text-[#0e0e0e] px-3 py-2 border border-[rgba(0,0,0,0.06)] rounded-full font-bold cursor-pointer shadow-[0_12px_28px_#00000014]">
                    Зберегти сценарій
                </button>
            </div>

            <div
                className="max-w-[600px] w-full my-8 mx-auto p-8 bg-white rounded-2xl border border-white shadow-[0_18px_40px_#ff83b02e,0_4px_10px_#0000000f]">
                <h2 className="text-lg font-semibold mb-2">📝 Твої сценарії</h2>
                <p>📝 Немає сценаріїв</p>
                <p className="text-sm text-gray-500">Створи перший сценарій у формі вище</p>
            </div>
        </div>
    );
}