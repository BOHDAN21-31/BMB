import {useState} from "react";
import {useAuth} from "../../../context/AuthProvider";
import {useNavigate, Link} from "react-router-dom";

export default function EnterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {signIn} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signIn(email, password);
            navigate("/MapPages");
        } catch (error) {
            alert("Помилка входу. Перевірте дані або спробуйте ще раз.");
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
                        Вхід до акаунту
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
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline outline-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:outline-[#ffcdd6] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-black-100"
                                >
                                    Пароль
                                </label>
                                <div className="text-sm">
                                    <a
                                        href="#"
                                        className="font-semibold text-[#ffcdd6] hover:text-indigo-300"
                                    >
                                        Забув пароль?
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline outline-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:outline-[#ffcdd6] sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#ffcdd6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                {loading ? "Зачекайте..." : "Увійти"}
                            </button>
                        </div>

                        <div>
                            <Link
                                to="/Register"
                                className="flex w-full justify-center rounded-md bg-[#ffcdd6] px-3 py-1.5 text-sm font-semibold text-black border-2 border-black hover:bg-[#ffd8e0]"
                            >
                                Реєстрація
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
