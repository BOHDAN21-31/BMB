export default function ManifestPage() {
    return (
        <main className="bg-white text-gray-800 font-sans">
            <section className="container mx-auto py-16 px-4">
                <h1 className="text-4xl lg:text-5xl font-bold mb-12 text-gray-900 max-w-4xl">
                    Тримай перший в світі
                    інструмент, управління поведінкою інших людей.
                </h1>
                <section className="py-16 px-4">
                    <div className="container mx-auto flex flex-col lg:flex-row justify-center items-center flex-wrap gap-8">
                        <div className="rounded-xl p-8 shadow-sm max-w-sm text-left bg-gray-100">
                            <h3 className="text-xl font-semibold mb-3">ЩО ТАКЕ БМБ</h3>
                            <p className="text-gray-700">
                                Buy My Behavior - це простір де люди створюють свою реальність управляючи поведінкою інших людей.
                            </p>
                        </div>
                        <div className="rounded-xl p-8 shadow-lg max-w-sm text-left bg-orange-500 text-white transform lg:scale-105">

                            <h3 className="text-xl font-semibold mb-3">ГАМАНЕЦЬ НА ДОНАТИ</h3>
                            <p>
                                Створи , підключити свій гаманець МетаМакс, сама на цей гаманець буде приходити тобі добровільні донати від учасників в USDT.
                            </p>
                        </div>
                        <div className="rounded-xl p-8 shadow-sm max-w-sm text-left bg-gray-100">
                            <h3 className="text-xl font-semibold mb-3">Алгоритм</h3>
                            <p className="text-gray-700">
                                90% виконавцю. 5% системі. 5% Амбасадору який надав реферальне слово, запросив учасника в систему.
                            </p>
                        </div>
                    </div>
                </section>
            </section>
            <section className="container mx-auto py-16 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <h2 className="text-5xl font-bold mb-4 text-gray-900">Про нас</h2>
                        <p className="text-2xl text-gray-600">
                            Простір працює по всьому світу, кожен користувач який реєструце з своєї
                            країни повинен в першу чергу розуміти, що він будучи громадянином цієї країни,
                            живе по законам цієї країни. Тому в системі BMB ви повинні виконувати закони своєї
                            країни не порушувати кримінальні ,соціальні, релігійні правила за якими живуть ваші співвітчизники.
                            Це перше правило, яке дасть вам довгий гарний користувацький досвід
                        </p>
                    </div>
                    <div className="flex flex-col justify-between h-full">
                        <p className="text-gray-700 mb-8 md:mb-0">
                            Давай вперед
                        </p>
                        <div className="w-10 h-10 flex items-center justify-center text-gray-900 text-3xl font-light cursor-pointer md:self-end">

                            →

                        </div>
                    </div>
                </div>

                {/* Placeholder for Banner Image */}
                <div className="w-full h-72 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 mt-12">
                    [Место для изображения 2]
                </div>
            </section>

            {/* СЕКЦИЯ 3: Услуги ИИ (image_30c1e6.jpg)
            */}
            <section className="bg-gray-50 py-16 px-4">
                <div className="container mx-auto flex flex-col lg:flex-row gap-12 items-center">
                    {/* Левая часть: Заголовок и "Изображение" */}
                    <div className="flex-1">
                        <h2 className="text-4xl font-bold mb-8 text-center lg:text-left text-gray-900">
                            Влияние ИИ на образование
                        </h2>
                        {/* Placeholder for Image */}
                        <div className="w-full h-80 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                            [Место для изображения 3]
                        </div>
                    </div>

                    {/* Правая часть: Список возможностей (карточки) */}
                    <div className="flex-1 flex flex-col space-y-8">
                        {/* Карточка 1 */}
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0 bg-orange-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xs font-medium">
                                [Иконка]
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">Агентство ИИ, готовое к будущему</h3>
                                <p className="text-gray-600">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                            </div>
                        </div>
                        {/* Карточка 2 */}
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0 bg-orange-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xs font-medium">
                                [Иконка]
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">Агентства на базе искусственного интеллекта</h3>
                                <p className="text-gray-600">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                            </div>
                        </div>
                        {/* Карточка 3 */}
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0 bg-orange-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xs font-medium">
                                [Иконка]
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900">Решения для агентств ИИ</h3>
                                <p className="text-gray-600">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.</p>
                            </div>
                        </div>

            {/* СЕКЦИЯ 5: Баннер и Клиенты (image_30c209.jpg)
            */}
                    </div>
                </div>
            </section>


            {/* Placeholder for Top Banner Image */}
            <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
                [Место для баннера 4]
            </div>

            <section className="bg-gray-50 py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center max-w-2xl mx-auto mb-12 text-gray-900">
                        5 миллионов компаний используют ИИ для улучшения своих систем по всему миру
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Карточка клиента 1 */}
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center flex flex-col items-center">
                            <div className="w-24 h-8 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500 text-sm">
                                [Лого]
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Оги</h3>
                            <p className="text-gray-600 text-sm">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren...</p>
                        </div>
                        {/* Карточка клиента 2 */}
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center flex flex-col items-center">
                            <div className="w-24 h-8 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500 text-sm">
                                [Лого]
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Элементы</h3>
                            <p className="text-gray-600 text-sm">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren...</p>
                        </div>
                        {/* Карточка клиента 3 */}
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center flex flex-col items-center">
                            <div className="w-24 h-8 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500 text-sm">
                                [Лого]
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Целостная жизнь</h3>
                            <p className="text-gray-600 text-sm">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren...</p>
                        </div>
                        {/* Карточка клиента 4 */}
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center flex flex-col items-center">
                            <div className="w-24 h-8 bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500 text-sm">
                                [Лого]
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Брайто</h3>
                            <p className="text-gray-600 text-sm">At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren...</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
