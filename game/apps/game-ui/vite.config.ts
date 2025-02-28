import { defineConfig } from "vite";

export default defineConfig({
    plugins: [],
    server: {
        host: "0.0.0.0",
        port: 3000,
        proxy: {
            "/socket.io": {
                target: "http://localhost:8080",
                changeOrigin: true,
                ws: true,
            },
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            }
        },
    },
});
