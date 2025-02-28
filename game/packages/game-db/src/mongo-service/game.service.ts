import { Types } from "mongoose";
import { GameEntityData } from "../types";
import {
    BuildingModel,
    GameModel,
    IGame,
    ResourceModel,
    UnitModel,
} from "../mongo-db";

export const getGameById = async (
    gameId: Types.ObjectId,
): Promise<IGame | null> => {
    const game = await GameModel.findById(gameId);
    if (!game) {
        return null;
    }
    return game;
};

export const getEntitiesByGameId = async (
    gameId: Types.ObjectId,
): Promise<GameEntityData> => {
    const gameEntityData: GameEntityData = {
        units: [],
        resources: [],
        buildings: [],
    };
    const units = await UnitModel.find({ gameId });
    if (units) {
        gameEntityData.units.push(...units);
    }
    const buildings = await BuildingModel.find({ gameId });
    if (buildings) {
        gameEntityData.buildings.push(...buildings);
    }
    const resources = await ResourceModel.find({ gameId });
    if (resources) {
        gameEntityData.resources.push(...resources);
    }

    return gameEntityData;
};
