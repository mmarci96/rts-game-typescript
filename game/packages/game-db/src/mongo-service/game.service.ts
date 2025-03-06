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
import { GameState, PlayerColor, Position } from "@packages/game-data";

const UNIT_SIZE = { height: 32, width: 32 };

const BASE_STATS = {
    warrior: { health: 20, speed: 8, damage: 4, attackSpeed: 2 },
    worker: { health: 10, speed: 4, damage: 1, attackSpeed: 1 },
    archer: { health: 12, speed: 6, damage: 6, attackSpeed: 2 },
};

export const deleteUnitById = async (unitId: Types.ObjectId) => {
    await UnitModel.findByIdAndDelete(unitId);
};
const createUnitModel = (
    unitType: string,
    position: Position,
    color: PlayerColor,
    gameId: Types.ObjectId,
) => {
    let stats;
    switch (unitType) {
        case "warrior":
            stats = BASE_STATS[unitType];
            break;
        case "worker":
            stats = BASE_STATS[unitType];
            break;
        case "archer":
            stats = BASE_STATS[unitType];
            break;
        default:
            return;
    }
    const unitData = {
        position,
        color,
        gameId,
        unitType: unitType,
        size: UNIT_SIZE,
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
    const unit = createUnitModel(
        unitType,
        position,
        color,
        new Types.ObjectId(gameId),
    );
    if (!unit) {
        return;
    }
    const saved = await unit.save();
    return saved;
};

export const deleteBuildingById = async (buildingId: Types.ObjectId) => {
    await BuildingModel.findByIdAndDelete(buildingId);
};

export const deleteResourceById = async (resourceId: Types.ObjectId) => {
    await ResourceModel.findByIdAndDelete(resourceId);
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
