import mongoose, { Document, Schema, Date, Types } from "mongoose";

enum GameStatus {
    RUNNING = "running",
    WAITING = "waiting",
    READY = "ready",
    OVER = "over",
}

interface IGame extends Document {
    _id: Types.ObjectId;
    mapId: Types.ObjectId;
    gameName: string;
    status: GameStatus;
    maxPlayers: number;
    winner?: Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
}

const gameSchema = new Schema({
    mapId: { type: mongoose.Schema.Types.ObjectId, ref: "Map", required: true },
    gameName: { type: String, required: true },
    status: { type: String, enum: GameStatus, default: GameStatus.WAITING },
    maxPlayers: { type: Number, required: true },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

const GameModel = mongoose.model<IGame>("Game", gameSchema);
export { GameModel, IGame, GameStatus };
