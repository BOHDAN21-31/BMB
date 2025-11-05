import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {supabase} from "../../../lib/supabaseClient";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [promo, setPromo] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const REFERRAL_WORD = "BMB";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const {data, error} = await supabase.auth.signUp({
                email,
                password,
                options: {data: {promo}},
            });

            if (error) {
                alert(error.message);
                setLoading(false);
                return;
            }

            if (promo !== REFERRAL_WORD) {
                console.warn("⚠️ Невірне реферальне слово");
            }

            alert("Підтвердіть реєстрацію через лист на пошті.");
            navigate("/EnterPage");
        } catch (err) {
            console.error(err);
            alert("Помилка реєстрації");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="By my Behavior"
                        src="/logo_for_reg.jpg"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-black">
                        Реєстрація з реферальним словом
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-black-100"
                            >
                                Електрона адреса
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline outline-1 outline-black/10 focus:outline-2 focus:outline-[#ffcdd6] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-black-100"
                            >
                                Пароль
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline outline-1 outline-black/10 focus:outline-2 focus:outline-[#ffcdd6] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="Promo"
                                className="block text-sm font-medium text-black-100"
                            >
                                Реферальний код
                            </label>
                            <div className="mt-2">
                                <input
                                    id="Promo"
                                    type="text"
                                    required
                                    value={promo}
                                    onChange={(e) => setPromo(e.target.value)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline outline-1 outline-black/10 focus:outline-2 focus:outline-[#ffcdd6] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#ffcdd6]"
                            >
                                {loading ? "Зачекайте..." : "Зареєструватися"}
                            </button>
                        </div>

                        <div>
                            <Link
                                to="/EnterPage"
                                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#ffcdd6]"
                            >
                                Увійти
                            </Link>
                        </div>

                        <div>
                            <button
                                type="button"
                                className="flex w-full justify-center rounded-md bg-[#ffcdd6] px-3 py-1.5 text-sm font-semibold text-black border-2 border-black hover:bg-[#ffd8e0]"
                            >
                                Увійти через MetaMask
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
