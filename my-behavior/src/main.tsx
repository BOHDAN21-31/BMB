import {StrictMode} from 'react'
import {createRoot} from "react-dom/client";
import {BrowserRouter, Routes, Route} from "react-router-dom";

import './index.css'
import Nav_bar from "./Nav_bar";
import RegisterPage from "./pages/Enteres_register/register/register";
import EnterPage from "./pages/Enteres_register/Enter/Enter";
import ManifestPage from "./pages/Manifest";

// @ts-ignore
import {registerSW} from "virtual:pwa-register";

registerSW({immediate: true});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Nav_bar/>
            <Routes>
                <Route path="/Register" element={<RegisterPage/>}/>,
                <Route path="/EnterPage" element={<EnterPage/>}/>,
                <Route path="/manifestPage" element={<ManifestPage/>}/>,
            </Routes>
        </BrowserRouter>
    </StrictMode>,
)
