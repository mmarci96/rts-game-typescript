import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GameEntity } from "@packages/game-data";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    const unit = new GameEntity({ x: 0, y: 1 })

    res.status(200).send({ health: "ok", data: { position: unit.getPosition() } });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
