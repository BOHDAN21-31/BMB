import {Outlet, Link, useLocation} from "react-router-dom";
import {useState, useEffect} from 'react';
import {
    Dialog,
    DialogPanel,
    PopoverGroup,
} from '@headlessui/react';
import {
    Bars3Icon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Nav_bar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="bg-white">
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-4">

                <div className="flex lg:flex-1">
                    <Link to="/manifestPage" className="-m-1.5 p-1.5">
                        <span className="sr-only">By My Behavior</span>
                        <h1 className="text-black text-xl font-bold">
                            By my Behavior
                        </h1>
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
                    <Link to="/manifestPage" className="text-sm/6 font-semibold text-black">
                        Профіль
                    </Link>
                    <a href="#" className="text-sm/6 font-semibold text-black">
                        Вибрати виконавця
                    </a>
                    <Link to="/manifestPage" className="text-sm/6 font-semibold text-black">
                        Мої замовлення
                    </Link>
                    <Link to="/manifestPage" className="text-sm/6 font-semibold text-black">
                        Отримані сценарії
                    </Link>
                    <Link to="/manifestPage" className="text-sm/6 font-semibold text-black">
                        Маніфест
                    </Link>
                </PopoverGroup>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <Link to="/Register" className="text-sm/6 font-semibold text-black">
                        Реєстрація <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>
            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <div className="fixed inset-0 z-50"/>
                <DialogPanel
                    className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
                >
                    <div className="flex items-center justify-between">
                        <Link to="/manifestPage" className="-m-1.5 p-1.5">
                            <span className="sr-only">By my Behevior</span>
                            <h1 className="text-black text-xl font-bold">
                                By my Behavior
                            </h1>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="-m-2.5 rounded-md p-2.5 text-black"
                        >
                            <span className="sr-only">Закрити меню</span>
                            <XMarkIcon aria-hidden="true" className="size-6"/>
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                <Link
                                    to="/manifestPage"
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Профіль
                                </Link>
                                <a
                                    href="#"
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Вибрати виконавця
                                </a>
                                <a
                                    href="#"
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Мої замовлення
                                </a>
                                <a
                                    href="#"
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Отримані сценарії
                                </a>
                                <Link
                                    to="/manifestPage"
                                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Маніфест
                                </Link>
                            </div>
                            <div className="py-6">
                                <Link
                                    to="/Register"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-black hover:bg-gray-50"
                                >
                                    Реєстрація
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
}