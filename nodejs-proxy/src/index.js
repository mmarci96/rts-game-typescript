import { Server } from "socket.io";
import WebSocket from "ws";

const clients = {};
const io = new Server(3001, {
    cors: { origin: "*" },
});

const goSocket = new WebSocket("ws://localhost:4000/ws"); // Connect to Go

// --- Relay messages from GO to client(s) ---
goSocket.on("message", (data) => {
    const { clientId, event, payload } = JSON.parse(data);
    const client = clients[clientId];
    if (client) {
        client.emit(event, payload);
    }
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    clients[socket.id] = socket;

    socket.onAny((event, payload) => {
        console.log("Event: ", event);
        console.log("Payload: ", payload);
        // Forward to Go
        const ctx = {
            clientId: socket.id,
            event,
            payload,
        };
        console.log("Sending message to Go socket: ", ctx);
        const msg = JSON.stringify(ctx);
        goSocket.send(msg);
    });

    socket.on("disconnect", () => {
        delete clients[socket.id];
        const ctx = {
            clientId: socket.id,
            event: "disconnect",
        };
        console.log("Disconneted socket: ", ctx);
        const msg = JSON.stringify(ctx);
        goSocket.send(msg);
    });
});
