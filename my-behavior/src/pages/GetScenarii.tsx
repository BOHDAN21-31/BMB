import React, {useState, useEffect} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider"; // Переконайтесь, що шлях вірний

// 1. Визначимо тип для даних, які повертає наша RPC-функція
interface ScenarioWithCreator {
    id: number;
    created_at: string;
    title: string;
    description: string;
    price: number;
    creator_id: string;
    creator_name: string | null;
    creator_avatar: string | null;
}

export default function GetScenario() {
    const {user} = useAuth();
    const [scenarios, setScenarios] = useState<ScenarioWithCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Функція для завантаження всіх сценаріїв
    const fetchScenarios = async () => {
        try {
            // Викликаємо нашу нову RPC-функцію
            const {data, error} = await supabase.rpc('get_all_scenarios_with_creator');

            if (error) throw error;
            if (data) {
                setScenarios(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 3. Завантажуємо дані при першому рендері
    useEffect(() => {
        fetchScenarios();

        // 4. Встановлюємо Realtime-підписку
        const channel = supabase
            .channel('public:scenarios')
            .on(
                'postgres_changes',
                {event: 'INSERT', schema: 'public', table: 'scenarios'},
                (payload) => {
                    // Коли хтось створює новий сценарій...
                    console.log('Новий сценарій!', payload.new);

                    // Найпростіший спосіб оновити список з JOIN-даними -
                    // це просто перезавантажити всі сценарії.
                    fetchScenarios();

                    // (Більш складний, але швидший метод -
                    // отримати 'payload.new', окремо запитати профіль
                    // і додати в 'setScenarios')
                }
            )
            .subscribe();

        // 5. Не забуваємо відписатися при "розмонтуванні"
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // 6. Функція для "Прийняття" (створення замовлення)
    const handleAccept = async (scenario: ScenarioWithCreator) => {
        if (!user) {
            alert("Будь ласка, увійдіть, щоб прийняти сценарій.");
            return;
        }

        if (user.id === scenario.creator_id) {
            alert("Ви не можете прийняти власний сценарій.");
            return;
        }

        try {
            const {error} = await supabase
                .from('orders')
                .insert({
                    scenario_id: scenario.id,
                    customer_id: user.id,
                    status: 'pending' // Початковий статус
                });

            if (error) throw error;

            alert(`✅ Сценарій "${scenario.title}" прийнято! Перевірте "Мої замовлення".`);

        } catch (err: any) {
            alert("Помилка при спробі прийняти: " + err.message);
        }
    };

    if (loading) {
        return <div className="p-4">Завантаження сценаріїв...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Помилка: {error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center">
                Ринок Сценаріїв
            </h1>

            {scenarios.length === 0 ? (
                <p className="text-center text-gray-500">
                    Поки що немає доступних сценаріїв. Створіть свій у профілі!
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarios.map((scenario) => (
                        <ScenarioCard
                            key={scenario.id}
                            scenario={scenario}
                            onAccept={() => handleAccept(scenario)}
                            currentUserId={user?.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// 7. Окремий компонент "Картка Сценарію" для чистоти коду
interface ScenarioCardProps {
    scenario: ScenarioWithCreator;
    onAccept: () => void;
    currentUserId?: string;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({scenario, onAccept, currentUserId}) => {

    const isOwner = scenario.creator_id === currentUserId;

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-5 flex flex-col justify-between">
            <div>
                {/* Інформація про творця */}
                <div className="flex items-center mb-3">
                    <img
                        src={scenario.creator_avatar || '/logo_for_reg.jpg'} // Запасне фото
                        alt={scenario.creator_name || 'Творець'}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <span className="font-medium text-gray-700">
                        {scenario.creator_name || 'Анонімний творець'}
                    </span>
                </div>

                {/* Інформація про сценарій */}
                <h2 className="text-xl font-semibold mb-2">{scenario.title}</h2>
                <p className="text-gray-600 mb-4">{scenario.description}</p>
            </div>

            {/* Ціна та Кнопка */}
            <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-bold text-green-600">
                    ${scenario.price.toLocaleString()}
                </span>

                <button
                    onClick={onAccept}
                    disabled={isOwner} // Блокуємо кнопку, якщо це ваш сценарій
                    className={`
                        px-4 py-2 rounded-lg font-semibold text-white transition-colors
                        ${isOwner
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800'
                    }
                    `}
                >
                    {isOwner ? 'Це ваш' : 'Прийняти'}
                </button>
            </div>
        </div>
    );
};