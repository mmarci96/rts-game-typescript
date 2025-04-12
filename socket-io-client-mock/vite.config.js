import { defineConfig } from "vite";

export default defineConfig({
    base: "/ui/",
    server: {
        host: "0.0.0.0",
        port: 3000,
        proxy: {
            "/server_0/socket.io": {
                target: "http://0.0.0.0:8080/server_0/socket.io",
                changeOrigin: true,
                ws: true,
            },
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
        },
    },
});
