import {Link} from "react-router-dom";

export default function RegisterPage() {
    return (
        <>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img
                        alt="By my Behavior"
                        src="../public/logo_for_reg.jpg"
                        className="mx-auto h-10 w-auto"
                    />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-black">Реєстрація з
                        реферальним словом</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form action="#" method="POST" className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-black-100">
                                Електрона адреса
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#ffcdd6] sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="Promo"
                                       className="block text-sm/6 font-medium text-black-100 text-center">
                                    Реферальний код
                                </label>

                            </div>
                            <div className="mt-2">
                                <input
                                    id="Promo"
                                    name="Promo"
                                    type="Promo"
                                    required
                                    autoComplete="current-promo"
                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-black outline-1 -outline-offset-1 outline-black/10 placeholder:text-black-500 focus:outline-2 focus:-outline-offset-2 focus:outline-[#ffcdd6] sm:text-sm/6"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-[#ffcdd6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Зарееструватися
                            </button>
                        </div>
                        <div>
                            <Link to="/EnterPage"
                                  type="submit"
                                  className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-[#ffcdd6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Увійти
                            </Link>
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-[#ffcdd6] px-3 py-1.5 text-sm/6 font-semibold text-black hover:bg-[#ffcdd6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 border-2 border-black"
                            >
                                Увійти через MetaMask
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}
