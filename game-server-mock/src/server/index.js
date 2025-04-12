import { config } from "../config.js";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
const { PORT, HOST, NAMESPACE } = config;
const app = express();

app.get("/health", (req, res) => {
    res.status(200).send({ health: "ok" });
});

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://**",
        methods: ["GET", "POST"],
    },
    path: `/ws/${NAMESPACE}`,
});

const connections = {};
const games = {};
const websocketController = (io) => {
    console.log(
        "Starting socket on: ",
        `http://${HOST}:${PORT}/ws/${NAMESPACE}`,
    );

    io.on("connection", (socket) => {
        console.log("New connection: ", socket.id);
        connections[socket.id] = {
            commands: [],
            load: null,
        };
        socket.on("pending_commands", (data) => {
            console.log(data);
            const { pendingCommands, playerId } = data;
            console.log("Player adding commands: ", playerId);
            console.log("Commands: ", pendingCommands);
            connections[socket.id].commands.push(pendingCommands);
        });
        socket.on("load_game", (data) => {
            connections[socket.id].load = data;
            console.log("Socket on load_game: ", connections[socket.id]);
            if (games[data.gameId]) {
                games[data.gameId].players.push(data.playerId);
            } else {
                games[data.gameId] = { players: [data.playerId], commands: [] };
            }
            socket.join(data.gameId);
        });
        setInterval(() => {
            console.log("Games: ", games);
            Object.entries(games).forEach(([data, gameId]) => {
                io.to(gameId).emit(data);
            });
            console.log("Connections: ", connections);
        }, 5000);

        socket.on("disconnect", async () => {
            console.log("Disconnected socket: ", connections[socket.id]);
            delete connections[socket.id];
        });
    });
};
websocketController(io);

export default server;
