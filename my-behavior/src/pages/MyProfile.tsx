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
                    className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
                    onClick={handleAvatarClick}
                >
                    {avatar ? (
                        <img src={avatar} alt="Avatar" className="w-full h-full object-cover"/>
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
                <span className="text-gray-500 text-sm">10.0 / 10 · 0 оцінок</span>
            </div>

            <div className="bg-gray-50 border rounded-2xl p-4 space-y-3">
                <h2 className="text-lg font-semibold">Налаштування</h2>
                <div className="flex justify-between items-center">
                    <span>Геолокація</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={geoEnabled}
                            onChange={() => setGeoEnabled(!geoEnabled)}
                            className="sr-only"
                        />
                        <div
                            className={`w-10 h-5 rounded-full transition ${
                                geoEnabled ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        ></div>
                        <div
                            className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition ${
                                geoEnabled ? "translate-x-5" : ""
                            }`}
                        ></div>
                    </label>
                </div>

                <div className="flex justify-between items-center">
                    <span>Пуш-сповіщення</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={pushEnabled}
                            onChange={() => setPushEnabled(!pushEnabled)}
                            className="sr-only"
                        />
                        <div
                            className={`w-10 h-5 rounded-full transition ${
                                pushEnabled ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        ></div>
                        <div
                            className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition ${
                                pushEnabled ? "translate-x-5" : ""
                            }`}
                        ></div>
                    </label>
                </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 space-y-3">
                <input
                    placeholder="Ім’я або псевдонім"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input w-full border rounded-lg p-2"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input w-full border rounded-lg p-2"
                >
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
                    className="input w-full border rounded-lg p-2"
                />
                <input
                    placeholder="BSC (BEP-20) гаманець або MetaMask"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="input w-full border rounded-lg p-2"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                    <button className="button bg-orange-200 rounded-xl px-4 py-2 font-semibold">
                        🦊 Підключити MetaMask
                    </button>
                    <button className="button bg-blue-200 rounded-xl px-4 py-2 font-semibold">
                        🛡 Пройти KYC
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="button bg-green-200 rounded-xl px-4 py-2 font-semibold"
                    >
                        💾 Зберегти профіль
                    </button>
                </div>
            </div>

            <div className="bg-white border rounded-2xl p-4 space-y-3">
                <h2 className="text-lg font-semibold">Створити сценарій</h2>
                <textarea
                    placeholder="Опис сценарію"
                    value={scenarioText}
                    onChange={(e) => setScenarioText(e.target.value)}
                    className="w-full border rounded-lg p-2"
                />
                <input
                    type="number"
                    placeholder="Ціна в USDT"
                    value={scenarioPrice ?? ""}
                    onChange={(e) => setScenarioPrice(Number(e.target.value))}
                    className="w-full border rounded-lg p-2"
                />
                <button
                    onClick={handleSaveScenario}
                    className="bg-green-200 rounded-xl px-4 py-2 font-semibold"
                >
                    Зберегти сценарій
                </button>
            </div>
            
            <div className="bg-white border rounded-2xl p-4 text-center">
                <h2 className="text-lg font-semibold mb-2">📝 Твої сценарії</h2>
                <p>📝 Немає сценаріїв</p>
                <p className="text-sm text-gray-500">Створи перший сценарій у формі вище</p>
            </div>
        </div>
    );
}
