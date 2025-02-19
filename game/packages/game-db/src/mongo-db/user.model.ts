import mongoose, { Document, Schema, Date, Types } from 'mongoose';

interface IUser extends Document {
    _id: Types.ObjectId;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt?: Date;
}

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
});

const UserModel = mongoose.model<IUser>('User', userSchema);
export { UserModel, IUser };
