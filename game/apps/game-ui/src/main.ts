import { ConnectionHandler } from "./connection";
window.addEventListener("load", async () => {
    try {
        await ConnectionHandler.initialize();
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
