import { Server } from "socket.io";
import WebSocket from "ws";

const HOST = "0.0.0.0";
const PORT = 3001;
const clients = {};

const goSocket = new WebSocket("ws://localhost:9000/ws");
const io = new Server(PORT, {
    cors: { origin: "*" },
});

console.log(`Server running on: http://${HOST}:${PORT}/`);

goSocket.onmessage = (msg) => {
    const payload = JSON.parse(msg.data);
    console.log("From Go:", payload);
    if (payload.type === "pong") {
        console.log("Pong from Go received.");
    }

    Object.values(clients).forEach((socket) => {
        socket.emit("from-go", payload);
    });
};

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    clients[socket.id] = socket;

    socket.onAny((event, payload) => {
        console.log("Event: ", event);
        console.log("Payload: ", payload);
        const ctx = {
            socket_id: socket.id,
            event,
            payload,
        };
        console.log("Sending message to Go socket: ", ctx);
        const msg = JSON.stringify(ctx);
        goSocket.send(msg);
    });
    // const updater = setInterval(() => {
    //     goSocket.send({ "Connected clients": clients });
    // }, 6000);

    // socket.on("stop_update_interval", (stopData) => {
    //     const c = clients[socket.id];
    //     console.log("Stop request: ", c);
    //     console.log("Stop data: ", stopData);
    //     if (stopData.id) {
    //         clearInterval(updater);
    //     }
    // });
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
