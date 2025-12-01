import React, {useState, useEffect} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {supabase} from "../../lib/supabaseClient";
import {useAuth} from "../../context/AuthProvider";
import {toast} from 'react-toastify';

export default function DisputePage() {
    const {orderId} = useParams();
    const {user} = useAuth();
    const navigate = useNavigate();

    const [order, setOrder] = useState<any>(null);
    const [votes, setVotes] = useState({performer: 0, customer: 0});
    const [myVote, setMyVote] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [loading, setLoading] = useState(true);

    const WIN_THRESHOLD = 248;
    const DISPUTE_HOURS = 72;

    useEffect(() => {
        fetchDisputeData();
        const interval = setInterval(fetchDisputeData, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    // Timer
    useEffect(() => {
        if (!order?.dispute_started_at) return;
        const timer = setInterval(() => {
            const start = new Date(order.dispute_started_at).getTime();
            const end = start + (DISPUTE_HOURS * 60 * 60 * 1000);
            const now = new Date().getTime();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft("00:00:00");
                // auto-resolve logic could go here
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${h}г ${m}хв`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [order]);

    const fetchDisputeData = async () => {
        if (!orderId) return;

        const {data: ord} = await supabase
            .from('orders')
            .select(`*, scenarios(title, price), performer:profiles!orders_performer_id_fkey(display_name), customer:profiles!orders_customer_id_fkey(display_name)`)
            .eq('id', orderId)
            .single();
        if (ord) setOrder(ord);

        const {data: vs} = await supabase.from('dispute_votes').select('*').eq('order_id', orderId);
        if (vs) {
            const perfVotes = vs.filter(v => v.vote_side === 'performer').length;
            const custVotes = vs.filter(v => v.vote_side === 'customer').length;
            setVotes({performer: perfVotes, customer: custVotes});

            if (user) {
                const mine = vs.find(v => v.voter_id === user.id);
                if (mine) setMyVote(mine.vote_side);
            }
        }
        setLoading(false);
    };

    const handleVote = async (side: 'performer' | 'customer') => {
        if (!user) return toast.error("Авторизуйтесь");
        if (myVote) return toast.info("Ви вже голосували");

        const {error} = await supabase.from('dispute_votes').insert({
            order_id: orderId,
            voter_id: user.id,
            vote_side: side
        });

        if (error) toast.error(error.message);
        else {
            toast.success("Ваш голос враховано!");
            setMyVote(side);
            fetchDisputeData();
        }
    };

    if (loading || !order) return <div className="p-10 text-center">Завантаження...</div>;

    const totalVotes = votes.performer + votes.customer;
    const perfPercent = totalVotes === 0 ? 50 : (votes.performer / totalVotes) * 100;

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black">←</button>
                <h1 className="text-xl font-bold">Спірне замовлення</h1>
            </div>

            <div className="p-6 space-y-6 max-w-2xl mx-auto">
                {/* Timer Banner */}
                <div
                    className="bg-black text-white p-6 rounded-3xl text-center shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)]">
                    <p className="text-gray-400 text-xs uppercase mb-1 tracking-widest">До завершення голосування</p>
                    <div className="text-4xl font-mono font-bold text-[#ffcdd6]">{timeLeft}</div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_0_20px_-5px_#ffcdd6] border border-white">
                    <div className="flex justify-between text-sm font-bold mb-3">
                        <span className="text-green-600">За Виконавця ({votes.performer})</span>
                        <span className="text-red-500">Проти ({votes.customer})</span>
                    </div>
                    <div className="h-6 w-full bg-red-100 rounded-full overflow-hidden flex relative">
                        <div
                            className="bg-green-500 h-full transition-all duration-500 flex items-center justify-end px-2"
                            style={{width: `${perfPercent}%`}}
                        >
                            <span className="text-[10px] text-white font-bold">{Math.round(perfPercent)}%</span>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">Потрібно {WIN_THRESHOLD} голосів для
                        перемоги</p>
                </div>

                {/* Proof Details */}
                <div className="bg-white p-5 rounded-3xl border border-white shadow-[0_0_20px_-5px_#ffcdd6]">
                    <h2 className="font-bold text-xl mb-2">{order.scenarios.title}</h2>
                    <p className="text-gray-600 mb-4 text-sm">{order.scenarios.description}</p>

                    <div className="border-t border-gray-100 pt-4">
                        <div
                            className="bg-black rounded-2xl overflow-hidden max-h-[400px] mb-3 border border-gray-100 shadow-inner">
                            {order.proof_type === 'video' ? (
                                <video src={order.proof_url} controls className="w-full h-full object-contain"/>
                            ) : (
                                <img src={order.proof_url} className="w-full h-full object-contain"/>
                            )}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl text-sm italic border border-gray-100">
                            <span
                                className="font-bold text-xs text-gray-400 uppercase block mb-1">Коментар виконавця</span>
                            "{order.proof_description}"
                        </div>
                    </div>
                </div>

                {/* Voting Buttons */}
                {!myVote && user?.id !== order.performer_id && user?.id !== order.customer_id ? (
                    <div className="flex gap-4">
                        <button
                            onClick={() => handleVote('customer')}
                            className="flex-1 py-4 bg-red-100 text-red-700 font-bold rounded-2xl hover:bg-red-200 transition shadow-sm"
                        >
                            👎 Не вірно<br/><span className="text-xs font-normal">Повернути гроші</span>
                        </button>
                        <button
                            onClick={() => handleVote('performer')}
                            className="flex-1 py-4 bg-green-100 text-green-700 font-bold rounded-2xl hover:bg-green-200 transition shadow-sm"
                        >
                            👍 Вірно<br/><span className="text-xs font-normal">Виплатити гроші</span>
                        </button>
                    </div>
                ) : (
                    <div
                        className="text-center bg-gray-100 p-4 rounded-2xl text-gray-500 font-bold border border-gray-200">
                        {myVote ? "Дякуємо за ваш голос!" : "Учасники конфлікту не голосують."}
                    </div>
                )}
            </div>
        </div>
    );
}