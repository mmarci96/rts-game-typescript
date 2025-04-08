import server from "./server/index.js";
import { Server } from "socket.io";
import { config } from "./config.js";
import websocketController from "./socket-io/index.js";

const { PORT, HOST, NAMESPACE } = config;

const main = async () => {
    try {
        const io = new Server(server, {
            cors: {
                origin: "http://localhost:**",
                methods: ["GET", "POST"],
            },
            path: `/${NAMESPACE}/`,
        });
        websocketController(io);

        server.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error(err);
        return;
    }
};
main();
