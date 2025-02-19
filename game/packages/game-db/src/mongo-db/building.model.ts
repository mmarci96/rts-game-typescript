import mongoose, { Document, Schema, Types } from "mongoose";
import { PlayerColor, Position } from "@packages/game-data/dist/data/types";

interface IBuilding extends Document {
    _id: Types.ObjectId;
    position: Position;
    color: PlayerColor;
    health: number;
    type: string;
    state: string;
    size: { width: number, height: number };
    gameId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const buildingSchema = new Schema<IBuilding>({
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    color: { type: String, enum: PlayerColor, required: true },
    health: { type: Number, required: true },
    type: { type: String, required: true },
    state: { type: String, default: "idle" },
    size: { type: { width: Number, height: Number }, required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Game" },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const BuildingModel = mongoose.model<IBuilding>('Building', buildingSchema);
export { BuildingModel, IBuilding }
