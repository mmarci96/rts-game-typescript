import { PlayerResources } from "@packages/game-data";
import mongoose, { Document, Schema, Types, Date } from "mongoose";

enum PlayerColor {
    RED = "red",
    BLUE = "blue",
    PURPLE = "purple",
    YELLOW = "yellow",
}

interface IPlayer extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    gameId: Types.ObjectId;
    name: string;
    color: PlayerColor;
    isReady: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
const PlayerResourcesSchema = new Schema<PlayerResources>(
    {
        wood: { type: Number, default: 200 },
        food: { type: Number, default: 200 },
    },
    { _id: false },
);

const playerSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Game",
    },
    name: { type: String, required: true },
    playerResources: { type: PlayerResourcesSchema, default: {} },
    isReady: { type: Boolean, default: false },
    color: { type: String, enum: PlayerColor, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

const PlayerModel = mongoose.model<IPlayer>("Player", playerSchema);

export { PlayerModel, IPlayer };
