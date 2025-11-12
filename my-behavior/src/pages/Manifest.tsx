import React from "react";

const CONTACT_EMAIL = "viktorsesiuk@gmail.com";

const Manifest: React.FC = () => {
    const handleAmbassadorClick = () => {
        const subject = "Стати амбасадором BMB";
        const body = `Привіт! Хочу стати амбасадором BMB.

Мене звати: ...
Посилання/аудиторія: ...
Місто/країна: ...

Дякую!`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
    };

    const handleContactClick = () => {
        const subject = "Запит реферального слова BMB";
        const body = `Вітаю! Прошу надати реферальне слово для реєстрації в BMB.

Мене звати: ...
Контакти: ...
Коротко про мене/аудиторію: ...

Дякую!`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
    };

    return (
        <div className="bg-gray-100 text-black min-h-screen">
            {/* HERO */}
            <header className="relative overflow-hidden py-12 sm:py-16">
                <div className="max-w-6xl mx-auto px-5 bg-white rounded-3xl shadow-md p-8 text-center relative z-10"
                     style={{
                         backgroundImage: `radial-gradient(900px 360px at 50% -20%, #fff7fa, transparent 60%), linear-gradient(180deg, #ffffff 0%, #fff7fa 100%)`,
                     }}
                >
          <span
              className="inline-block bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm font-semibold text-sm mb-2">
            Маніфест
          </span>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-3">
                        Buy My Behavior
                    </h1>

                    <div
                        className="h-px w-11/12 max-w-3xl mx-auto bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3"/>

                    <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto opacity-90">
                        Buy My Behavior — цифровий Web3-простір, де люди обмінюються сценаріями поведінки,
                        узгоджують умови та захищають угоди ескроу-смартконтрактом.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {["Web3", "Escrow Smart-Contract", "Open Source"].map((pill) => (
                            <span key={pill}
                                  className="inline-block px-3 py-1 rounded-full border border-gray-200 bg-white shadow-sm text-sm font-semibold">
                {pill}
              </span>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-5 py-6 space-y-6">
                {/* Що таке BMB */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-2xl font-extrabold">Що таке BMB</h2>
                    <div className="space-y-3 text-sm sm:text-base leading-relaxed">
                        <p>
                            Buy My Behavior — це цифровий Web3-простір, де люди обмінюються між собою сценаріями
                            поведінки. До сьогодні еволюція не дала нам можливості моделювати поведінку інших людей,
                            читати їхні думки й ідеально взаємодіяти між собою.
                        </p>
                        <p>
                            Дружнє середовище взаємних вчинків BMB дозволяє вам моделювати поведінку навколишніх людей
                            з описом того, як саме людина має себе поводити — щоб для вас це було ідеальною
                            комунікацією...
                        </p>
                        <p>
                            Під час реєстрації ви проходите KYC, і ми відкриваємо вам можливість отримувати благодійні
                            внески
                            в розмірі <b>до 1 000 USDT за одну угоду</b>. Якщо ви знаменита людина і ваша поведінка — це
                            щось
                            дійсно величне, ви можете пройти глибший KYC — тоді сума ваших благодійних донатів-подяк
                            становитиме
                            <b> до 10 000 USDT за одну угоду</b>.
                        </p>
                    </div>
                </section>

                {/* Як це працює + Замовлення */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-3">
                        <h2 className="text-2xl font-extrabold">Як це працює</h2>
                        <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                            <li>Отримавши реферальне слово від Амбасадора BMB, ви реєструєтесь...</li>
                            <li>Опишіть, у чому ви сильні та які життєві комбінації здатні втілити...</li>
                            <li>За згодою користувача відображається геопозиція...</li>
                            <li>Оберіть виконавця → натисніть «Замовити поведінку» → узгодьте опис сценарію...</li>
                            <li>Після «Погодити угоду» ескроу-смартконтракт блокує донат...</li>
                        </ol>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-3">
                        <h2 className="text-2xl font-extrabold">Замовлення</h2>
                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                            <li>Опишіть сценарій і важливі нюанси ідеальної взаємодії.</li>
                            <li>Вкажіть час і дату, оберіть місце на карті.</li>
                            <li>За бажанням додайте суму донату в USDT для підтримки творчості виконавця.</li>
                        </ul>
                    </div>
                </section>

                {/* Елемент спору */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-3">
                    <h2 className="text-2xl font-extrabold">Елемент спору</h2>
                    <p className="text-sm sm:text-base leading-relaxed">
                        Якщо замовник не впевнений у виконанні, він може натиснути «Оскаржити виконання». Умикається
                        смартконтракт спору...
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-1">Приклад</h3>
                            <p className="text-sm">Замовлено: вигукнути «Це найкраща ідея...»</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-1">Голосування</h3>
                            <p className="text-sm">Триває 7 днів або до набрання 101 голосу.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <h3 className="font-semibold mb-1">Рішення</h3>
                            <p className="text-sm">Результат голосування автоматично виконується смартконтрактом.</p>
                        </div>
                    </div>
                </section>

                {/* Амбасадори */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-4">
                    <h2 className="text-2xl font-extrabold">Амбасадори</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                            <p>Середовище BMB є новим, тож вільну реєстрацію закрито...</p>
                            <p>Усі добровільні донати розподіляються смартконтрактом...</p>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <div className="flex h-3 w-full rounded-full overflow-hidden bg-gray-200">
                                    <div className="bg-pink-400 w-9/10"/>
                                    <div className="bg-gray-400 w-1/20"/>
                                    <div className="bg-gray-400 w-1/20"/>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs mt-1">
                                    <span><span className="inline-block w-2 h-2 bg-pink-400 rounded-full mr-1"></span>90% Виконавець</span>
                                    <span><span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"></span>5% Платформа</span>
                                    <span><span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1"></span>5% Амбасадор</span>
                                </div>
                            </div>

                            <button
                                onClick={handleAmbassadorClick}
                                className="px-4 py-2 rounded-full border border-gray-300 bg-white shadow-sm font-semibold hover:-translate-y-1 transition-transform"
                            >
                                Стати амбасадором
                            </button>
                        </div>
                    </div>
                </section>

                {/* Відкритий код */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-extrabold">Відкритий код</h2>
                    <p className="text-sm sm:text-base leading-relaxed">
                        Buy My Behavior створений з відкритим кодом...
                    </p>
                </section>

                {/* Застереження */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-3">
                    <h2 className="text-2xl font-extrabold">Застереження</h2>
                    <ul className="list-disc list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                        <li>BMB не є постачальником послуг чи платіжною установою...</li>
                        <li>BMB не надає юридичних або податкових консультацій...</li>
                        <li>Геолокація використовується лише за згодою користувача...</li>
                    </ul>

                    <div className="flex flex-col items-center gap-2 mt-3">
                        <p className="text-xs text-gray-500">Щоб отримати реферальне слово, вам слід написати на
                            пошту.</p>
                        <button
                            onClick={handleContactClick}
                            className="px-4 py-2 rounded-full border border-gray-300 bg-white shadow-sm font-semibold hover:-translate-y-1 transition-transform"
                        >
                            ✉️ Написати на пошту
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Manifest;
