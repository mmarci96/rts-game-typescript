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
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

export default server;
