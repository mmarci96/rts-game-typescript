import { Server } from "socket.io";
import WebSocket from "ws";
import { socketIoHandler } from "./ws-handler/socket-io/index.js";
import { goSocketHandler } from "./ws-handler/go-server/index.js";

const HOST = "0.0.0.0";
const PORT = 3001;
const clients = {};
const main = async () => {
    try {
        const io = new Server(PORT, {
            cors: { origin: "*" },
        });
        const goSocket = new WebSocket("ws://localhost:9000/ws"); // Connect to Go

        console.log(`Server running on: http://${HOST}:${PORT}/`);
        goSocketHandler(goSocket, clients);
        socketIoHandler(goSocket, io, clients);
    } catch (err) {
        console.error("Error on node bridge: ", err);
    }
};
main();
