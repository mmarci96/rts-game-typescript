import { Types } from "mongoose";
import { GameEntityData } from "../types";
import {
    BuildingModel,
    GameModel,
    GameStatus,
    IGame,
    IUnit,
    PlayerModel,
    ResourceModel,
    UnitModel,
} from "../mongo-db";
import {
    GameState,
    PlayerColor,
    Position,
    BASE_UNIT_CONFIG,
} from "@packages/game-data";

export const setWinnerOnGameOver = async (gameId: string, playerId: string) => {
    const winnerPlayer = await PlayerModel.findById(playerId);
    if (!winnerPlayer) {
        throw new Error("No winner found");
    }
    const game = await GameModel.findByIdAndUpdate(gameId, {
        winner: winnerPlayer.userId,
        status: GameStatus.OVER,
    });
    return game;
};

export const deleteUnitById = async (unitId: string) => {
    const id = new Types.ObjectId(unitId);
    await UnitModel.findByIdAndDelete(id);
};

export const createUnitModel = (
    unitType: string,
    position: Position,
    color: PlayerColor,
    gameId: string,
) => {
    let stats;
    switch (unitType) {
        case "warrior":
            stats = BASE_UNIT_CONFIG[unitType];
            break;
        case "worker":
            stats = BASE_UNIT_CONFIG[unitType];
            break;
        case "archer":
            stats = BASE_UNIT_CONFIG[unitType];
            break;
        default:
            return;
    }
    const gameIdToSave = new Types.ObjectId(gameId);
    const unitData = {
        position,
        color,
        gameId: gameIdToSave,
        unitType: unitType,
        size: { width: stats.radius, height: stats.height },
        ...stats,
    };
    return new UnitModel(unitData);
};

export const createUnit = async (
    gameId: string,
    spawnX: number,
    spawnY: number,
    color: PlayerColor,
    unitType: string,
) => {
    const position: Position = { x: spawnX, y: spawnY };
    const unit = createUnitModel(unitType, position, color, gameId);
    if (!unit) {
        return;
    }
    const saved = await unit.save();
    return saved;
};

export const deleteBuildingById = async (buildingId: string) => {
    const id = new Types.ObjectId(buildingId);
    await BuildingModel.findByIdAndDelete(id);
};

export const deleteResourceById = async (resourceId: string) => {
    const id = new Types.ObjectId(resourceId);
    await ResourceModel.findByIdAndDelete(id);
};

export const saveEntitiesToMongo = async (
    gameId: string,
    gameState: GameState,
) => {
    if (gameState.units.length > 0) {
        await Promise.all(
            gameState.units.map(async (unit) => {
                const existing = await UnitModel.findById(unit.id);
                if (!existing) {
                    console.log(unit.id, unit);
                    return;
                }
                if (!unit.health) {
                    await UnitModel.findByIdAndDelete(unit.id);
                    return;
                }
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
                if (!resource.availableResource) {
                    await ResourceModel.findByIdAndDelete(resource.id);
                    return;
                }
                await ResourceModel.findOneAndUpdate(
                    { _id: resource.id, gameId },
                    resource,
                    { upsert: true, new: true },
                );
            }),
        );
    }
};

export const getGameById = async (gameId: string): Promise<IGame | null> => {
    const id = new Types.ObjectId(gameId);
    const game = await GameModel.findById(id);
    if (!game) {
        return null;
    }
    return game;
};

export const getEntitiesByGameId = async (
    id: string,
): Promise<GameEntityData> => {
    const gameId = new Types.ObjectId(id);
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
