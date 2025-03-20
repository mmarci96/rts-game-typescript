import { PlayerColor } from "@packages/game-data/dist/data/types";
import { createUnitModel } from "@packages/game-db/dist";
import { IUnit, UnitModel } from "@packages/game-db/dist/mongo-db/unit.model";

const getStarterPositionByColor = (color: PlayerColor, mapSize: number) => {
    const starterPosition = { x: 16, y: 16 };
    switch (color) {
        case "red":
            break;
        case "blue":
            starterPosition.x = mapSize - 16;
            starterPosition.y = mapSize - 16;
            break;
        case "yellow":
            starterPosition.x = mapSize - 16;
            break;
        case "purple":
            starterPosition.y = mapSize - 16;
            break;
        default:
            break;
    }
    return starterPosition;
};

const getSpawnDirection = (color: PlayerColor) => {
    const direction = { dx: 2, dy: 2 };
    switch (color) {
        case PlayerColor.RED:
            break;
        case PlayerColor.BLUE:
            direction.dx = -2;
            direction.dy = -2;
            break;
        case PlayerColor.YELLOW:
            direction.dx = -2;
            break;
        case PlayerColor.PURPLE:
            direction.dy = -2;
            break;
        default:
            break;
    }
    return direction;
};

const createUnits = (
    unitType: string,
    amount: number,
    color: PlayerColor,
    mapSize: number,
    gameId: string,
) => {
    const starterPosition = getStarterPositionByColor(color, mapSize);
    const direction = getSpawnDirection(color);
    const units = [];
    for (let i = 0; i < amount; i++) {
        const spawnX = starterPosition.x + i * direction.dx;
        const spawnY = starterPosition.y + i * direction.dy;
        const position = { x: spawnX, y: spawnY };
        const unit = createUnitModel(unitType, position, color, gameId);
        units.push(unit);
    }
    return units;
};

export const generateStarterUnits = async (
    color: PlayerColor,
    mapSize: number,
    gameId: string,
): Promise<IUnit[] | void> => {
    const warriorCount = 2;
    const workerCount = 4;
    const archerCount = 2;

    try {
        const warriors = createUnits(
            "warrior",
            warriorCount,
            color,
            mapSize,
            gameId,
        );
        const savedWarriors = await UnitModel.insertMany(warriors);

        const workers = createUnits(
            "worker",
            workerCount,
            color,
            mapSize,
            gameId,
        );
        const savedWorkers = await UnitModel.insertMany(workers);

        const archers = createUnits(
            "archer",
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
