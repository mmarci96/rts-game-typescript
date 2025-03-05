import { Types } from "mongoose";
import { GameEntityData } from "../types";
import {
    BuildingModel,
    GameModel,
    IGame,
    IUnit,
    ResourceModel,
    UnitModel,
} from "../mongo-db";
import { GameState } from "@packages/game-data";

export const deleteUnitById = async (unitId: Types.ObjectId) => {
    await UnitModel.findByIdAndDelete(unitId);
};

export const deleteBuildingById = async (buildingId: Types.ObjectId) => {
    await BuildingModel.findByIdAndDelete(buildingId);
};

export const deleteResourceById = async (resourceId: Types.ObjectId) => {
    await ResourceModel.findByIdAndDelete(resourceId);
};

export const saveEntitiesToMongo = async (
    gameId: Types.ObjectId,
    gameState: GameState,
) => {
    if (gameState.units.length > 0) {
        await Promise.all(
            gameState.units.map(async (unit) => {
                await UnitModel.findOneAndUpdate(
                    { _id: unit.id, gameId },
                    unit,
                    { upsert: true, new: true },
                );
            }),
        );
    }

    if (gameState.buildings.length > 0) {
        await Promise.all(
            gameState.buildings.map(async (building) => {
                await BuildingModel.findOneAndUpdate(
                    { _id: building.id, gameId },
                    building,
                    { upsert: true, new: true },
                );
            }),
        );
    }

    if (gameState.resources.length > 0) {
        await Promise.all(
            gameState.resources.map(async (resource) => {
                await ResourceModel.findOneAndUpdate(
                    { _id: resource.id, gameId },
                    resource,
                    { upsert: true, new: true },
                );
            }),
        );
    }
};

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
        const alive = units.filter((unit: IUnit) => unit.health > 0);
        gameEntityData.units.push(...alive);
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
