import mongoose, { Document, Schema, Types } from "mongoose";
import { Position } from "@packages/game-data/dist/data/types";

interface IResource extends Document {
    _id: Types.ObjectId;
    position: Position;
    availableResource: number;
    type: string;
    size: { width: number, height: number };
    gameId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const resourceSchema = new Schema<IResource>({
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
    },
    availableResource: { type: Number, required: true },
    type: { type: String, required: true },
    size: { type: { width: Number, height: Number }, required: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Game" },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const ResourceModel = mongoose.model<IResource>('Resource', resourceSchema);
export { ResourceModel, IResource }
