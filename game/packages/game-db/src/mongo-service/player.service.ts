import { Types } from "mongoose";
import { IPlayer, PlayerModel } from "../mongo-db";

export const getPlayerById = async (
    playerId: Types.ObjectId,
): Promise<IPlayer | null> => {
    const player = await PlayerModel.findById(playerId);
    if (!player) {
        return null;
    }
    return player;
};

export const setPlayerReadyStatus = async (
    playerId: Types.ObjectId,
    readyStatus: boolean,
) => {
    const player = await PlayerModel.findByIdAndUpdate(playerId, {
        isReady: readyStatus,
    });
    if (!player) {
        return null;
    }
    return player;
};
