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
    color: PlayerColor;
    createdAt: Date;
    updatedAt?: Date;
}

const playerSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    gameId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Game" },
    color: { type: String, enum: PlayerColor, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

const PlayerModel = mongoose.model<IPlayer>("Player", playerSchema);

export { PlayerModel, IPlayer };

