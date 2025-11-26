import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./index.css";

import RegisterPage from "./pages/Enteres_register/register/register";
import EnterPage from "./pages/Enteres_register/Enter/Enter";
import ManifestPage from "./pages/Manifest";
import ProfilePage from "./pages/MyProfile";
import LiveMap from "./pages/MapPages/Map_Pages";
import Nav_bar from "./Nav_bar";
import {AuthProvider} from "./context/AuthProvider";
import GetScenario from "./pages/GetScenarii";
import MyOrders from "./pages/MyOrderPages";

// @ts-ignore
import {registerSW} from "virtual:pwa-register";
import CreateOrderPage from "./pages/Order/Order-creat";

registerSW({immediate: true});

const container = document.getElementById("root");
if (!container) throw new Error("Root container not found!");

createRoot(container).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Nav_bar/>
                <Routes>
                    <Route path="/Register" element={<RegisterPage/>}/>
                    <Route path="/EnterPage" element={<EnterPage/>}/>
                    <Route path="/manifestPage" element={<ManifestPage/>}/>
                    <Route path="/UsProfile" element={<ProfilePage/>}/>
                    <Route path="/GetScenario" element={<GetScenario/>}/>
                    <Route path="/MapPages" element={<LiveMap/>}/>
                    <Route path="/MyOrders" element={<MyOrders/>}/>
                    <Route path="/create-order" element={<CreateOrderPage/>}/>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
