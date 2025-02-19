import mongoose, { Document, Schema, Types } from "mongoose";

interface IMap extends Document {
    _id: Types.ObjectId;
    tiles: [];
    type: string;
    size: string;
    createdAt: Date;
}

const mapSchema = new Schema({
    tiles: [],
    type: String,
    size: { type: String, enum: ['small', 'medium', 'large'], required: true },
    createdAt: { type: Date, default: Date.now }
})

const MapModel = mongoose.model<IMap>('Map', mapSchema);
export { MapModel, IMap };
