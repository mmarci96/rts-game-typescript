import mongoose, { Document, Schema, Types } from "mongoose";
import { PlayerColor, Position } from "@packages/game-data/dist/data/types";

enum UnitType {
    ARCHER = "archer",
    WARRIOR = "warrior",
    WORKER = "worker",
}

interface Target {
    x: number | null;
    y: number | null;
    id: Types.ObjectId | null;
}

interface IUnit extends Document {
    _id: Types.ObjectId;
    position: Position;
    color: PlayerColor;
    health: number;
    speed: number;
    damage: number;
    attackSpeed: number;
    type: UnitType;
    state: string;
    target: Target;
    size: { width: number; height: number };
    gameId: Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
}

const TargetSchema = new Schema<Target>(
    {
        x: { type: Number, default: null },
        y: { type: Number, default: null },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "Unit",
        },
    },
    { _id: false },
);

const unitSchema = new Schema<IUnit>({
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    color: { type: String, enum: PlayerColor, required: true },
    health: { type: Number, required: true },
    speed: { type: Number, required: true },
    damage: { type: Number, required: true },
    attackSpeed: { type: Number, required: true },
    type: { type: String, enum: UnitType, required: true },
    state: { type: String, default: "idle" },
    target: { type: TargetSchema, default: {} },
    size: {
        type: new Schema({ width: Number, height: Number }, { _id: false }),
        required: true,
    },
    gameId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Game",
    },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});
const UnitModel = mongoose.model<IUnit>("Unit", unitSchema);

export { UnitModel, IUnit, UnitType, Target };
