import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
    base: "/game-ui/",
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
            },
        },
    },
    resolve: {
        alias: {
            "@packages/game-data": path.resolve(
                __dirname,
                "../../node_modules/@packages/game-data/src/index.ts",
            ),
        },
    },
});
