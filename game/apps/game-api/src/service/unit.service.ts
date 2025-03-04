import { PlayerColor, Position } from "@packages/game-data/dist/data/types";
import {
    IUnit,
    UnitModel,
    UnitType,
} from "@packages/game-db/dist/mongo-db/unit.model";
import { Types } from "mongoose";

const UNIT_SIZE = { height: 64, width: 24 };

const BASE_STATS = {
    warrior: { health: 20, speed: 8, damage: 4, attackSpeed: 2 },
    worker: { health: 10, speed: 4, damage: 1, attackSpeed: 1 },
    archer: { health: 12, speed: 6, damage: 6, attackSpeed: 2 },
};

const getStarterPositionByColor = (color: PlayerColor, mapSize: number) => {
    const starterPosition = { x: 0, y: 0 };
    switch (color) {
        case "red":
            break;
        case "blue":
            starterPosition.x = mapSize - 8;
            starterPosition.y = mapSize - 8;
            break;
        case "yellow":
            starterPosition.x = mapSize - 8;
            break;
        case "purple":
            starterPosition.y = mapSize - 8;
            break;
        default:
            break;
    }
    return starterPosition;
};

const getSpawnDirection = (color: PlayerColor) => {
    const direction = { dx: 1, dy: 1 };
    switch (color) {
        case PlayerColor.RED:
            break;
        case PlayerColor.BLUE:
            direction.dx = -1;
            direction.dy = -1;
            break;
        case PlayerColor.YELLOW:
            direction.dx = -1;
            break;
        case PlayerColor.PURPLE:
            direction.dy = -1;
            break;
        default:
            break;
    }
    return direction;
};

const createUnit = (
    unitType: UnitType,
    position: Position,
    color: PlayerColor,
    gameId: Types.ObjectId,
) => {
    const stats = BASE_STATS[unitType];
    const unitData = {
        position,
        color,
        gameId,
        type: unitType,
        size: UNIT_SIZE,
        ...stats,
    };
    return new UnitModel(unitData);
};

const createUnits = (
    unitType: UnitType,
    amount: number,
    color: PlayerColor,
    mapSize: number,
    gameId: Types.ObjectId,
) => {
    const starterPosition = getStarterPositionByColor(color, mapSize);
    const direction = getSpawnDirection(color);
    const units = [];
    for (let i = 0; i < amount; i++) {
        const spawnX = starterPosition.x + i * direction.dx;
        const spawnY = starterPosition.y + i * direction.dy;
        const position = { x: spawnX, y: spawnY };
        const unit = createUnit(unitType, position, color, gameId);
        units.push(unit);
    }
    return units;
};

export const generateStarterUnits = async (
    color: PlayerColor,
    mapSize: number,
    gameId: Types.ObjectId,
): Promise<IUnit[] | void> => {
    const warriorCount = 10;
    const workerCount = 2;
    const archerCount = 4;

    try {
        const warriors = createUnits(
            UnitType.WARRIOR,
            warriorCount,
            color,
            mapSize,
            gameId,
        );
        const savedWarriors = await UnitModel.insertMany(warriors);

        const workers = createUnits(
            UnitType.WORKER,
            workerCount,
            color,
            mapSize,
            gameId,
        );
        const savedWorkers = await UnitModel.insertMany(workers);

        const archers = createUnits(
            UnitType.ARCHER,
            archerCount,
            color,
            mapSize,
            gameId,
        );
        const savedArchers = await UnitModel.insertMany(archers);

        const units: IUnit[] = [
            ...savedWarriors,
            ...savedWorkers,
            ...savedArchers,
        ];
        return units;
    } catch (err) {
        console.error(err);
    }
};
