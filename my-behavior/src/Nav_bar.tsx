import {Outlet, Link, useLocation, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import {Dialog, DialogPanel, PopoverGroup} from "@headlessui/react";
import {Bars3Icon, XMarkIcon} from "@heroicons/react/24/outline";
import {useAuth} from "./context/AuthProvider";

export default function Nav_bar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const {user, signOut} = useAuth();

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = async () => {
        await signOut();
        navigate("/EnterPage");
    };

    return (
        <header className="bg-white border-b border-gray-200">
            <nav
                aria-label="Global"
                className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-4"
            >
                <div className="flex lg:flex-1">
                    <Link to="/manifestPage" className="-m-1.5 p-1.5">
                        <span className="sr-only">Buy My Behavior</span>
                        <h1 className="text-black text-xl font-bold">Buy my Behavior</h1>
                    </Link>
                </div>

                <div className="flex lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="size-6"/>
                    </button>
                </div>

                <PopoverGroup className="hidden lg:flex lg:gap-x-12">
                    {user ? (

                        <>
                            <Link
                                to="/UsProfile"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Профіль
                            </Link>
                            <Link
                                to="/MapPages"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Вибрати виконавця
                            </Link>
                            <Link
                                to="/MyOrders"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Мої замовлення
                            </Link>
                            <Link
                                to="/GetScenario"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Отримати сценарії
                            </Link>
                            <Link
                                to="/manifestPage"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Маніфест
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/manifestPage"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Маніфест
                            </Link>
                            <Link
                                to="/MapPages"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Вибрати виконавця
                            </Link>
                        </>
                    )}
                </PopoverGroup>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-3">
                    {!user ? (
                        <>
                            <Link
                                to="/EnterPage"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Увійти
                            </Link>
                            <Link
                                to="/Register"
                                className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                            >
                                Реєстрація →
                            </Link>
                        </>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="text-sm font-semibold text-black hover:text-[#ffcdd6]"
                        >
                            Вийти
                        </button>
                    )}
                </div>
            </nav>

            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <div className="fixed inset-0 z-50"/>
                <DialogPanel
                    className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
                >
                    <div className="flex items-center justify-between">
                        <Link to="/manifestPage" className="-m-1.5 p-1.5">
                            <span className="sr-only">Buy my Behavior</span>
                            <h1 className="text-black text-xl font-bold">Buy my Behavior</h1>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="-m-2.5 rounded-md p-2.5 text-black"
                        >
                            <XMarkIcon aria-hidden="true" className="size-6"/>
                        </button>
                    </div>

                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {user ? (
                                    <>
                                        <Link
                                            to="/UsProfile"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Профіль
                                        </Link>
                                        <Link
                                            to="/MapPages"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Вибрати виконавця
                                        </Link>
                                        <Link
                                            to="/MyOrders"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Мої замовлення
                                        </Link>
                                        <Link
                                            to="/GetScenario"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Отримати сценарії
                                        </Link>
                                        <Link
                                            to="/manifestPage"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Маніфест
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/manifestPage"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Маніфест
                                        </Link>
                                        <Link
                                            to="/MapPages"
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Вибрати виконавця
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="py-6">
                                {!user ? (
                                    <>
                                        <Link
                                            to="/EnterPage"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Увійти
                                        </Link>
                                        <Link
                                            to="/Register"
                                            className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-black hover:bg-gray-50"
                                        >
                                            Реєстрація
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleLogout}
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-black hover:bg-gray-50"
                                    >
                                        Вийти
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
}
