import { Server } from "socket.io";
import WebSocket from "ws";

const io = new Server(3001, {
    cors: { origin: "*" },
});

const goSocket = new WebSocket("ws://localhost:4000"); // Connect to Go

// --- Relay messages from GO to client(s) ---
goSocket.on("message", (data) => {
    const { clientId, event, payload } = JSON.parse(data);
    const client = clients[clientId];
    if (client) {
        client.emit(event, payload);
    }
});

const clients = {};

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    clients[socket.id] = socket;

    socket.onAny((event, payload) => {
        // Forward to Go
        const msg = JSON.stringify({
            clientId: socket.id,
            event,
            payload,
        });
        goSocket.send(msg);
    });

    socket.on("disconnect", () => {
        delete clients[socket.id];
        const msg = JSON.stringify({
            clientId: socket.id,
            event: "disconnect",
        });
        goSocket.send(msg);
    });
});
