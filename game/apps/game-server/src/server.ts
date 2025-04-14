import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { websocketController } from "./ws";
import { config } from "./config";
const app = express();
const { NAMESPACE } = config;

app.get("/health", (req: Request, res: Response) => {
    res.status(200).send({ health: "ok" });
});

app.get("/ping", (req: Request, res: Response) => {
    res.status(200).send("PONG");
});

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:**",
        methods: ["GET", "POST"],
    },
    path: `/${NAMESPACE}`,
});
websocketController(io);

export default server;
