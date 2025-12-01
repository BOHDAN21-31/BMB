import React, {useState, useEffect} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {useNavigate} from "react-router-dom";

// Інтерфейс вхідного запиту (має співпадати з тим, що повертає SQL функція get_incoming_requests)
interface IncomingRequest {
    order_id: number;
    status: string;
    created_at: string;
    execution_time: string;
    title: string;
    description: string;
    price: number;
    requester_id: string;
    requester_name: string;
    requester_avatar: string;
    location_lat: number | null;
    location_lng: number | null;
}

export default function GetScenario() {
    const {user} = useAuth();
    const [requests, setRequests] = useState<IncomingRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Функція завантаження запитів
    const fetchRequests = async () => {
        if (!user) return;
        try {
            // Викликаємо SQL-функцію, яку ми створили раніше
            const {data, error} = await supabase.rpc('get_incoming_requests');

            if (error) throw error;
            if (data) {
                setRequests(data as IncomingRequest[]);
            }
        } catch (err: any) {
            console.error("Помилка завантаження вхідних запитів:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();

        // Підписка на нові замовлення в реальному часі
        const channel = supabase
            .channel('incoming-orders-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `performer_id=eq.${user?.id}` // Слухаємо тільки ті, що прийшли мені
                },
                (payload) => {
                    console.log('Отримано нове замовлення!', payload);
                    // Оновлюємо список
                    fetchRequests();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-gray-400 animate-pulse">Перевірка пошти... 📩</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-3xl mx-auto p-6 space-y-8">

                {/* Заголовок */}
                <div className="text-center space-y-2 mt-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Вхідні Запити 📬
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Сценарії, які інші користувачі пропонують вам виконати
                    </p>
                </div>

                {/* Список карток */}
                {requests.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-white shadow-[0_10px_40px_-10px_#ffcdd6]">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-800">Поки що пусто</h3>
                        <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                            Тут з'являться замовлення, коли хтось обере вас на карті.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {requests.map((req) => (
                            <RequestCard key={req.order_id} request={req}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- КОМПОНЕНТ КАРТКИ ---
const RequestCard: React.FC<{ request: IncomingRequest }> = ({request}) => {
    const navigate = useNavigate();

    // Форматування дати та часу
    const dateObj = new Date(request.execution_time);
    const dateStr = dateObj.toLocaleDateString('uk-UA', {day: 'numeric', month: 'long'});
    const timeStr = dateObj.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});

    const handleClick = () => {
        // Переходимо на детальну сторінку
        navigate(`/order-details/${request.order_id}`, {state: {request}});
    };

    return (
        <div
            onClick={handleClick}
            className="group bg-white p-6 rounded-3xl border-2 border-white
                       shadow-[0_15px_40px_-10px_rgba(255,205,214,0.6)]
                       hover:shadow-[0_20px_50px_-5px_#ffcdd6]
                       hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
            {/* Елемент декору при наведенні */}
            <div
                className="absolute top-0 right-0 w-24 h-24 bg-[#ffcdd6]/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500"></div>

            <div className="relative z-10">
                {/* Верхня частина: Аватар та Ціна */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex items-center gap-4">
                        {/* Аватар з білою рамкою та тінню */}
                        <div
                            className="w-14 h-14 rounded-full border-[3px] border-white shadow-[0_5px_15px_rgba(255,205,214,0.8)] overflow-hidden">
                            <img
                                src={request.requester_avatar || '/logo_for_reg.jpg'}
                                alt={request.requester_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">Замовник</p>
                            <h3 className="font-bold text-lg text-gray-900">{request.requester_name || "Інкогніто"}</h3>
                        </div>
                    </div>

                    {/* Стікер ціни */}
                    <div className={`px-4 py-2 rounded-2xl font-bold text-sm shadow-sm border
                        ${request.price > 0
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-[#fff0f5] text-[#ff6b8b] border-[#ffcdd6]'
                    }`}
                    >
                        {request.price > 0 ? `${request.price} USDT` : "Безкоштовно"}
                    </div>
                </div>

                {/* Основна інформація */}
                <div className="space-y-3">
                    <h4 className="font-bold text-xl text-gray-900 leading-tight">
                        {request.title}
                    </h4>

                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                        {request.description}
                    </p>

                    {/* Інфо-чіпи: Час та Локація */}
                    <div className="flex flex-wrap gap-3 pt-2">
                        <div
                            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-medium text-gray-600">
                            <span>📅</span> {dateStr}
                        </div>
                        <div
                            className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-medium text-gray-600">
                            <span>⏰</span> {timeStr}
                        </div>
                        {request.location_lat && (
                            <div
                                className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 text-xs font-medium text-blue-600">
                                <span>📍</span> Локація на карті
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Заклик до дії (з'являється при наведенні на ПК, на мобільному просто місце) */}
            <div
                className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-400 font-medium">Натисніть для деталей</span>
                <div
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shadow-lg transform group-hover:rotate-45 transition-transform duration-300">
                    ↗
                </div>
            </div>
        </div>
    );
};