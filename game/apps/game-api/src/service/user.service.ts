import bcrypt from 'bcrypt';
import { UserModel } from "@packages/game-db/dist";

export const createUser = async (email: string, username: string, password: string) => {
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
        throw new Error('Email taken');

    }

    const existingUsername = await UserModel.findOne({ username });
    if (existingUsername) {
        throw new Error('Username taken');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new UserModel({
        email, username, password: hashedPassword
    })

    const savedUser = await user.save();
    return {
        id: savedUser._id,
        email: savedUser.email,
        username: savedUser.username,
        createdAt: savedUser.createdAt
    }
}

export const loginUser = async (email: string, password: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error('No user found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        throw new Error('Email or password incorrect')
    }

    return {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
    }
}
