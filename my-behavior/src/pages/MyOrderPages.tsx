import React, {useState, useEffect, useCallback} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {Link, useNavigate} from "react-router-dom";

// Інтерфейс
interface MyOrderDetails {
    order_id: number;
    order_status: string;
    execution_time: string;
    title: string;
    description: string;
    price: number;
    requester_name: string | null;
    requester_avatar: string | null;
    location_lat: number | null;
    location_lng: number | null;
}

export default function MyOrdersPage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<MyOrderDetails[]>([]);
    const [loading, setLoading] = useState(true);

    // Стан для табів: 'active' або 'completed'
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

    const fetchMyOrders = useCallback(async () => {
        if (!user) return;
        try {
            const {data, error} = await supabase.rpc('get_my_accepted_orders');
            if (error) throw error;
            if (data) setOrders(data as MyOrderDetails[]);
        } catch (err: any) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyOrders();
        // Можна додати realtime підписку тут
    }, [fetchMyOrders]);

    // Фільтрація списку залежно від табу
    const filteredOrders = orders.filter(order => {
        if (activeTab === 'active') {
            // Активні: в роботі
            return order.order_status === 'in_progress';
        } else {
            // Виконані: completed або expired
            return ['completed', 'expired'].includes(order.order_status);
        }
    });

    if (loading) return <div className="p-10 text-center animate-pulse">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-3xl mx-auto p-6 space-y-6">

                <h1 className="text-3xl font-bold text-center text-gray-900 mt-4">Мої Завдання</h1>

                {/* --- ТАБИ (ПЕРЕМИКАЧІ) --- */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'active'
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        В роботі ⚡️
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'completed'
                                ? 'bg-green-500 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Виконані ✅
                    </button>
                </div>

                {/* СПИСОК */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        {activeTab === 'active'
                            ? "Немає активних завдань."
                            : "Ви ще не виконали жодного завдання."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {filteredOrders.map((order) => (
                            <OrderCard key={order.order_id} order={order} navigate={navigate}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- КАРТКА ---
const OrderCard: React.FC<{ order: MyOrderDetails, navigate: any }> = ({order, navigate}) => {

    const handleClick = () => {
        // Ми приводимо дані до єдиного формату IncomingRequest, який очікує сторінка деталей
        const requestFormat = {
            order_id: order.order_id,
            status: order.order_status, // Важливо: OrderDetails очікує 'status', а не 'order_status'
            execution_time: order.execution_time,
            title: order.title,
            description: order.description,
            price: order.price,

            // Дані про співрозмовника (якщо це мої замовлення, то співрозмовник - це замовник)
            other_name: order.requester_name,
            other_avatar: order.requester_avatar,

            // Координати
            location_lat: order.location_lat,
            location_lng: order.location_lng
        };

        navigate(`/order-pages/${order.order_id}`, {state: {request: requestFormat}});
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white p-5 rounded-3xl border border-white shadow-[0_5px_20px_-5px_#ffcdd6] cursor-pointer hover:scale-[1.02] transition-transform"
        >
            <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    order.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'expired' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                }`}>
                    {order.order_status === 'completed' ? 'Виконано' :
                        order.order_status === 'expired' ? 'Прострочено' : 'В роботі'}
                </span>
                <span className="font-bold text-sm text-gray-700">{order.price} USDT</span>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1">{order.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-1">{order.description}</p>

            <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-50">
                <img src={order.requester_avatar || '/logo_for_reg.jpg'}
                     className="w-8 h-8 rounded-full border border-gray-200"/>
                <span className="text-sm font-bold text-gray-700">{order.requester_name || "Користувач"}</span>
            </div>
        </div>
    );
};