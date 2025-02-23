import { PlayerModel } from "@packages/game-db";
import { Types } from "mongoose";

export const deletePlayerByUserId = async (userId: Types.ObjectId) => {
    const players = await PlayerModel.find({ userId }).deleteMany();
    if (!players) {
        throw new Error("No players found!");
    }
    return { data: players, messege: "Delete succes!" };
};
