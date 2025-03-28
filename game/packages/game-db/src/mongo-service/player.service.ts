import { IPlayer, PlayerModel } from "../mongo-db";
import { PlayerResources } from "@packages/game-data";

export const getPlayersByGameId = async (
    gameId: string,
): Promise<IPlayer[]> => {
    return await PlayerModel.find({ gameId });
};

export const getPlayerById = async (
    playerId: string,
): Promise<IPlayer | null> => {
    const player = await PlayerModel.findById(playerId);
    if (!player) {
        return null;
    }
    return player;
};

export const setPlayerReadyStatus = async (
    playerId: string,
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

export const updatePlayerResources = async (
    playerId: string,
    playerResources: PlayerResources,
) => {
    const player = await PlayerModel.findByIdAndUpdate(
        playerId,
        { $set: { playerResources } },
        { upsert: true, new: true },
    );

    return player;
};
