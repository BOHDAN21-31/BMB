import React, {useState, useEffect, useCallback} from "react";
import {supabase} from "../lib/supabaseClient";
import {useAuth} from "../context/AuthProvider";
import {Link} from "react-router-dom";

interface MyOrderDetails {
    order_id: number;
    order_status: string;
    order_created_at: string;
    scenario_id: number;
    scenario_title: string;
    scenario_description: string;
    scenario_price: number;
    creator_id: string;
    creator_name: string | null;
    creator_avatar: string | null;
}

export default function MyOrders() {
    const {user} = useAuth();
    const [orders, setOrders] = useState<MyOrderDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMyOrders = useCallback(async () => {
        try {
            const {data, error} = await supabase.rpc('get_my_orders');
            if (error) throw error;
            if (data) {
                setOrders(data);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Нове замовлення отримано!', payload.new);
                    fetchMyOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, fetchMyOrders]);

    if (loading) {
        return <div className="p-4 text-center">Завантаження ваших замовлень...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">Помилка: {error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center">
                Мої Отримані Сценарії
            </h1>

            {orders.length === 0 ? (
                <p className="text-center text-gray-500">
                    Ви ще не прийняли жодного сценарію.
                    <Link to="/GetScenario" className="text-blue-500 hover:underline ml-1">
                        Перейти до ринку
                    </Link>
                </p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.order_id} order={order}/>
                    ))}
                </div>
            )}
        </div>
    );
}

const OrderCard: React.FC<{ order: MyOrderDetails }> = ({order}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold">{order.scenario_title}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                    ${order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.order_status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                `}>
                    {order.order_status}
                </span>
            </div>

            <p className="text-gray-600 mb-4">{order.scenario_description}</p>

            <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <img
                            src={order.creator_avatar || '/logo_for_reg.jpg'}
                            alt={order.creator_name || 'Творець'}
                            className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                        <span className="text-sm text-gray-700">
                            Творець: {order.creator_name || 'Анонім'}
                        </span>
                    </div>
                    <span className="text-xl font-bold text-green-600">
                        ${order.scenario_price.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};