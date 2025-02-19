import mongoose, { Document, Schema, Date, Types } from 'mongoose';

interface IGame extends Document {
    _id: Types.ObjectId;
    players: Types.ObjectId[];
    units: Types.ObjectId[];
    buildings: Types.ObjectId[];
    resources: Types.ObjectId[];
    map: Types.ObjectId;
    createdAt: Date;
}

const gameSchema = new Schema({
    players: { type: [mongoose.Schema.Types.ObjectId], ref: 'Player' },
    units: { type: [mongoose.Schema.Types.ObjectId], ref: 'Unit' },
    buildings: { type: [mongoose.Schema.Types.ObjectId], ref: 'Building' },
    resources: { type: [mongoose.Schema.Types.ObjectId], ref: 'Resource' },
    map: { type: mongoose.Schema.Types.ObjectId, ref: 'Map' },
    createdAt: { type: Date, default: Date.now }
})

const GameModel = mongoose.model<IGame>('Game', gameSchema);
export { GameModel, IGame };

