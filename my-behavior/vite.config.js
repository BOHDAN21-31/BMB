import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from "vite-plugin-pwa";

const manifest = {
    "theme_color": "#8936FF",
    "background_color": "#2EC6FE",
    "icons": [{
        "purpose": "maskable",
        "sizes": "512x512",
        "src": "icon512_maskable.png",
        "type": "image/png"
    }, {"purpose": "any", "sizes": "512x512", "src": "icon512_rounded.png", "type": "image/png"}],
    screenshorts: [
        {
            src: "/public/screnshots/Screnshoot-dekstop.jpg",
            type: "image/png",
            sizes: "1280x723",
            form_factor: "wide",
        },
        {
            src: "/public/screnshots/screnshot-mobile-vers.jpg",
            type: "image/png",
            sizes: "561x1280",
            form_factor: "narrow",
        },
    ],

    "orientation": "any",
    "display": "standalone",
    "dir": "auto",
    "lang": "uk-UA"
}

export default defineConfig({
    plugins: [react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate", workbox: {
                globPatterns: ["**/*{html,css,js,ico,png,svg,jpg}"],
            },
            manifest: manifest,
        }),
    ],
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
})