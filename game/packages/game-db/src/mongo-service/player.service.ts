import { Types } from "mongoose";
import { IPlayer, PlayerModel } from "../mongo-db";
import { PlayerResources } from "@packages/game-data";

export const getPlayerById = async (
    playerId: string,
): Promise<IPlayer | null> => {
    const id = new Types.ObjectId(playerId);
    const player = await PlayerModel.findById(id);
    if (!player) {
        return null;
    }
    return player;
};

export const setPlayerReadyStatus = async (
    playerId: string,
    readyStatus: boolean,
) => {
    const id = new Types.ObjectId(playerId);
    const player = await PlayerModel.findByIdAndUpdate(id, {
        isReady: readyStatus,
    });
    if (!player) {
        return null;
    }
    return player;
};

export const updatePlayerResources = async (
    playerId: string,
    playerResources: PlayerResources,
) => {
    const id = new Types.ObjectId(playerId);
    const player = await PlayerModel.findByIdAndUpdate(
        id,
        { $set: { playerResources } },
        { upsert: true, new: true },
    );

    return player;
};
