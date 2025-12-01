import React, {useState, useEffect} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

// Інтерфейс
interface RequestItem {
    order_id: number;
    status: string; // Це поле має бути обов'язковим
    order_status?: string; // Може приходити з бази
    created_at: string;
    execution_time: string;
    title: string;
    description: string;
    price: number;
    counterparty_id?: string;
    counterparty_name?: string;
    counterparty_avatar?: string;
    location_lat: number | null;
    location_lng: number | null;
}

export default function GetScenario() {
    const {user} = useAuth();
    const [incoming, setIncoming] = useState<RequestItem[]>([]);
    const [outgoing, setOutgoing] = useState<RequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. ВХІДНІ
            const {data: inData} = await supabase.rpc('get_incoming_requests');
            if (inData) {
                const mappedIn = inData.map((item: any) => ({
                    ...item,
                    // Гарантуємо, що status заповнено
                    status: item.status || item.order_status || 'unknown',
                    counterparty_name: item.requester_name,
                    counterparty_avatar: item.requester_avatar
                }));
                setIncoming(mappedIn);
            }

            // 2. ВИХІДНІ (Тут була проблема)
            const {data: outData} = await supabase.rpc('get_my_created_orders');
            if (outData) {
                const activeOut = outData.filter((o: any) =>
                    ['pending', 'paid_pending_execution', 'pending_execution', 'in_progress', 'completed_pending_approval'].includes(o.order_status)
                );

                const mappedOut = activeOut.map((item: any) => ({
                    ...item,
                    // !!! ВИПРАВЛЕННЯ: Явно призначаємо status із order_status
                    status: item.order_status || item.status || 'unknown',
                    counterparty_name: item.performer_name || "Очікує...",
                    counterparty_avatar: item.performer_avatar
                }));
                setOutgoing(mappedOut);
            }

        } catch (err: any) {
            console.error("Помилка:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const channel = supabase
            .channel('orders-updates')
            .on('postgres_changes', {event: '*', schema: 'public', table: 'orders'}, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    if (loading) {
        return <div className="p-10 text-center animate-pulse text-gray-400">Завантаження...</div>;
    }

    const displayedList = activeTab === 'incoming' ? incoming : outgoing;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <h1 className="text-3xl font-bold text-center text-gray-900 mt-4">Запити 📬</h1>

                {/* --- ТАБИ --- */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('incoming')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative ${
                            activeTab === 'incoming' ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Вхідні
                        {incoming.length > 0 && (
                            <span
                                className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('outgoing')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'outgoing' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Відправлені
                    </button>
                </div>

                {/* --- СПИСОК --- */}
                {displayedList.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-3xl border border-white shadow-[0_10px_40px_-10px_#ffcdd6]">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-gray-800">Поки що пусто</h3>
                        <p className="text-gray-400 mt-2 max-w-xs mx-auto">
                            {activeTab === 'incoming'
                                ? "Вам ще ніхто не надіслав пропозицій."
                                : "Ви ще не створили жодного активного запиту."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {displayedList.map((req) => (
                            <RequestCard
                                key={req.order_id}
                                request={req}
                                type={activeTab}
                                onRefresh={fetchData}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- КОМПОНЕНТ КАРТКИ ---
interface RequestCardProps {
    request: RequestItem;
    type: 'incoming' | 'outgoing';
    onRefresh: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({request, type, onRefresh}) => {
    const navigate = useNavigate();

    const dateObj = new Date(request.execution_time);
    const dateStr = dateObj.toLocaleDateString('uk-UA', {day: 'numeric', month: 'long'});
    const timeStr = dateObj.toLocaleTimeString('uk-UA', {hour: '2-digit', minute: '2-digit'});

    const handleClick = () => {
        const requestForDetails = {
            ...request,
            other_name: request.counterparty_name,
            other_avatar: request.counterparty_avatar
        };
        navigate(`/order-details/${request.order_id}`, {state: {request: requestForDetails}});
    };

    const handleAccept = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await supabase.from('orders').update({status: 'in_progress'}).eq('id', request.order_id);
            toast.success("✅ Прийнято!");
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDecline = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Відхилити?")) return;
        try {
            await supabase.from('orders').update({status: 'cancelled'}).eq('id', request.order_id);
            toast.info("Відхилено.");
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Статус бейдж (БЕЗПЕЧНА ВЕРСІЯ)
    const getStatusLabel = () => {
        // Захист від undefined: якщо status немає, беремо order_status, або 'unknown'
        const safeStatus = request.status || request.order_status || 'unknown';

        if (safeStatus === 'completed_pending_approval') return {
            text: "❗ Потребує перевірки",
            color: "bg-orange-100 text-orange-700 animate-pulse"
        };
        if (safeStatus === 'in_progress') return {text: "В роботі", color: "bg-blue-50 text-blue-700"};

        // Тепер це безпечно, бо safeStatus точно рядок
        if (safeStatus.includes('pending')) return {text: "Очікує", color: "bg-yellow-50 text-yellow-700"};

        return {text: safeStatus, color: "bg-gray-100"};
    };

    const statusInfo = getStatusLabel();

    return (
        <div
            onClick={handleClick}
            className="group bg-white p-6 rounded-3xl border-2 border-white
                       shadow-[0_15px_40px_-10px_rgba(255,205,214,0.6)]
                       hover:shadow-[0_20px_50px_-5px_#ffcdd6]
                       hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-full border-[3px] border-white shadow-[0_5px_15px_rgba(255,205,214,0.8)] overflow-hidden bg-gray-100">
                        <img
                            src={request.counterparty_avatar || '/logo_for_reg.jpg'}
                            alt={request.counterparty_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-0.5">
                            {type === 'incoming' ? "Замовник" : "Виконавець"}
                        </p>
                        <h3 className="font-bold text-lg text-gray-900">{request.counterparty_name || "..."}</h3>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-xl font-bold text-xs ${statusInfo.color}`}>
                        {statusInfo.text}
                    </div>
                    <div className={`text-xs font-bold ${request.price > 0 ? 'text-green-600' : 'text-pink-500'}`}>
                        {request.price > 0 ? `${request.price} USDT` : "Free"}
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xl text-gray-900 leading-tight line-clamp-1">{request.title}</h4>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">{request.description}</p>

                <div className="flex gap-3 pt-2">
                    <span className="bg-gray-50 px-2 py-1 rounded-lg text-xs text-gray-500">📅 {dateStr}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded-lg text-xs text-gray-500">⏰ {timeStr}</span>
                </div>
            </div>

            {type === 'incoming' && request.status && request.status.includes('pending') && (
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 relative z-20">
                    <button
                        onClick={handleDecline}
                        className="py-3 rounded-xl border border-gray-200 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
                    >
                        Відхилити
                    </button>
                    <button
                        onClick={handleAccept}
                        className="py-3 rounded-xl bg-black text-white font-bold shadow-lg hover:bg-gray-800 transition-colors"
                    >
                        Прийняти
                    </button>
                </div>
            )}

            {type === 'outgoing' && request.status === 'completed_pending_approval' && (
                <div className="pt-4 border-t border-gray-100 relative z-20">
                    <button
                        className="w-full py-3 rounded-xl bg-green-500 text-white font-bold shadow-lg hover:bg-green-600 animate-pulse"
                        onClick={handleClick}
                    >
                        👀 Перевірити виконання
                    </button>
                </div>
            )}
        </div>
    );
};