import { PlayerModel } from "@packages/game-db/dist";
import { Types } from "mongoose";

export const getPlayerById = async (id: Types.ObjectId) => {
    const player = await PlayerModel.findById(id);
    if (!player) {
        throw new Error("No players found!");
    }
    return { data: player };
};

export const deletePlayerByUserId = async (userId: Types.ObjectId) => {
    const players = await PlayerModel.deleteMany({ userId });
    if (!players) {
        throw new Error("No players found!");
    }
    return { data: players, messege: "Delete succes!" };
};
