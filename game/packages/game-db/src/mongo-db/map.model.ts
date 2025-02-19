import mongoose, { Document, Schema, Types } from "mongoose";
import { Tile } from "@packages/game-data/dist/data/types";

interface IMap extends Document {
    _id: Types.ObjectId;
    tiles: Tile[];
    type?: string;
    size?: string;
    createdAt: Date;
}

const mapSchema = new Schema({
    tiles: [],
    type: String,
    size: { type: String, enum: ['small', 'medium', 'large'] },
    createdAt: { type: Date, default: Date.now }
})

const MapModel = mongoose.model<IMap>('Map', mapSchema);
export { MapModel, IMap };
