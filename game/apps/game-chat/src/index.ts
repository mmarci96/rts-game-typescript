import { createServer } from "http";
import { Server, Socket } from "socket.io";

import express from "express";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const users = new Map();

io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join", (username: string) => {
        users.set(socket.id, username);
        socket.broadcast.emit("user-joined", username);
    });

    socket.on("chat-message", (message: string) => {
        const username = users.get(socket.id) || "Anonymous";
        io.emit("chat-message", { username, message });
    });

    socket.on("disconnect", () => {
        const username = users.get(socket.id);
        users.delete(socket.id);
        if (username) {
            socket.broadcast.emit("user-left", username);
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
});
