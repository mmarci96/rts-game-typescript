import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { websocketController } from "./ws";
const app = express();

app.get("/health", (req: Request, res: Response) => {
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
websocketController(io);

export default server;
