import express from "express";
import cors from "cors";
import http from "http";
const app = express();

app.get("/health", (req, res) => {
    res.status(200).send({ health: "ok" });
});

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
export default server;
