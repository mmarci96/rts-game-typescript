import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
const app = express();

app.get("/health", (req, res) => {
    res.status(200).send({ health: "ok" });
});

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:**",
        methods: ["GET", "POST"],
    },
});

const connections = {};

const websocketController = (io) => {
    io.on("connection", (socket) => {
        console.log("New connection: ", socket.id);
        connections[socket.id] = {};
        socket.on("pending_commands", (data) => {
            connections[socket.id].commands = data;
            console.log("Socket on pending_commands: ", connections[socket.id]);
        });
        socket.on("load_game", (data) => {
            connections[socket.id].load = data;
            console.log("Socket on load_game: ", connections[socket.id]);
        });

        socket.on("disconnect", async () => {
            console.log("Disconnected socket: ", connections[socket.id]);
            delete connections[socket.id];
        });
    });
};
websocketController(io);

export default server;
