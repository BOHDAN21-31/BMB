import React, {useState, useEffect, useCallback} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {Link, useNavigate} from "react-router-dom";

interface OrderItem {
    order_id: number;
    order_status: string;
    execution_time: string;
    title: string;
    description: string;
    price: number;
    counterparty_name: string | null;
    counterparty_avatar: string | null;
    location_lat: number | null;
    location_lng: number | null;
}

export default function MyOrdersPage() {
    const {user} = useAuth();
    const navigate = useNavigate();

    const [performerOrders, setPerformerOrders] = useState<OrderItem[]>([]);
    const [customerOrders, setCustomerOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'in_progress' | 'completed' | 'my_requests'>('in_progress');

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // 1. Performer orders
            const {data: perfData} = await supabase.rpc('get_my_accepted_orders');
            if (perfData) {
                const mappedPerf = perfData.map((o: any) => ({
                    ...o,
                    counterparty_name: o.requester_name,
                    counterparty_avatar: o.requester_avatar
                }));
                setPerformerOrders(mappedPerf);
            }

            // 2. Customer orders
            const {data: custData} = await supabase.rpc('get_my_created_orders');
            if (custData) {
                const mappedCust = custData.map((o: any) => ({
                    ...o,
                    counterparty_name: o.performer_name || "Ще не призначено",
                    counterparty_avatar: o.performer_avatar
                }));
                setCustomerOrders(mappedCust);
            }

        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
        const channel = supabase
            .channel('my-orders-update')
            .on('postgres_changes', {event: '*', schema: 'public', table: 'orders'}, () => fetchData())
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const getDisplayedOrders = () => {
        if (activeTab === 'in_progress') {
            return performerOrders.filter(o => o.order_status === 'in_progress');
        }
        if (activeTab === 'completed') {
            return performerOrders.filter(o => ['completed', 'expired'].includes(o.order_status));
        }
        if (activeTab === 'my_requests') {
            return customerOrders;
        }
        return [];
    };

    const displayedOrders = getDisplayedOrders();

    if (loading) return <div className="p-10 text-center animate-pulse">Завантаження...</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="max-w-3xl mx-auto p-6 space-y-6">

                <h1 className="text-3xl font-bold text-center text-gray-900 mt-4">Мої Завдання</h1>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('in_progress')}
                        className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'in_progress' ? 'bg-[#ffcdd6] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        В роботі ⚡️
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`flex-1 py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                            activeTab === 'completed' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        Виконані ✅
                    </button>
                </div>

                {displayedOrders.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        Список порожній.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {displayedOrders.map((order) => (
                            <OrderCard
                                key={order.order_id}
                                order={order}
                                navigate={navigate}
                                isCustomerTab={activeTab === 'my_requests'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const OrderCard: React.FC<{ order: OrderItem, navigate: any, isCustomerTab: boolean }> = ({
                                                                                              order,
                                                                                              navigate,
                                                                                              isCustomerTab
                                                                                          }) => {

    const handleClick = () => {
        if (isCustomerTab) return;

        const requestFormat = {
            order_id: order.order_id,
            status: order.order_status,
            execution_time: order.execution_time,
            title: order.title,
            description: order.description,
            price: order.price,
            other_name: order.counterparty_name,
            other_avatar: order.counterparty_avatar,
            location_lat: order.location_lat,
            location_lng: order.location_lng
        };
        navigate(`/order-details/${order.order_id}`, {state: {request: requestFormat}});
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/edit-order/${order.order_id}`);
    };

    let statusBadge = "bg-gray-100 text-gray-600";
    let statusText = order.order_status;

    if (order.order_status === 'in_progress') {
        statusBadge = "bg-blue-100 text-blue-700";
        statusText = "В роботі";
    } else if (order.order_status === 'completed') {
        statusBadge = "bg-green-100 text-green-700";
        statusText = "Завершено";
    } else if (order.order_status === 'completed_pending_approval') {
        statusBadge = "bg-orange-100 text-orange-700 animate-pulse";
        statusText = "Очікує підтвердження";
    } else if (order.order_status === 'paid_pending_execution') {
        statusBadge = "bg-purple-100 text-purple-700";
        statusText = "Оплачено, очікує";
    } else if (order.order_status === 'pending_execution') {
        statusBadge = "bg-yellow-100 text-yellow-700";
        statusText = "Очікує";
    }

    return (
        <div
            onClick={handleClick}
            className={`group bg-white p-5 rounded-3xl border border-white shadow-[0_5px_20px_-5px_#ffcdd6] relative transition-transform ${
                !isCustomerTab ? 'cursor-pointer hover:scale-[1.02]' : ''
            }`}
        >
            {isCustomerTab && order.order_status !== 'completed' && order.order_status !== 'expired' && (
                <button
                    onClick={handleEdit}
                    className="absolute top-4 right-4 z-10 p-2 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 rounded-xl shadow-sm transition-all cursor-pointer"
                    title="Редагувати"
                >
                    ✏️
                </button>
            )}

            <div className="flex justify-between items-start mb-3 pr-10">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusBadge}`}>
                    {statusText}
                </span>
                {!isCustomerTab && (
                    <span className={`font-bold text-sm ${order.price > 0 ? 'text-green-600' : 'text-pink-500'}`}>
                        {order.price > 0 ? `${order.price} USDT` : "Free"}
                    </span>
                )}
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{order.title}</h3>
            <p className="text-gray-500 text-sm line-clamp-1">{order.description}</p>

            <div className="mt-4 flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-8 h-8 rounded-full border border-gray-200 overflow-hidden shadow-sm">
                    <img src={order.counterparty_avatar || '/logo_for_reg.jpg'} className="w-full h-full object-cover"/>
                </div>
                <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-bold">
                        {isCustomerTab ? "Виконавець" : "Замовник"}
                    </span>
                    <span className="text-sm font-bold text-gray-700">
                        {order.counterparty_name}
                    </span>
                </div>
            </div>
        </div>
    );
};