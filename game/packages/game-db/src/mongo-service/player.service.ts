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
