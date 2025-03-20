import { PlayerColor } from "@packages/game-data/dist/data/types";
import { BuildingModel } from "@packages/game-db/dist";
import { Types } from "mongoose";

export const createMainBuilding = async (
    color: PlayerColor,
    mapSize: number,
    gameId: Types.ObjectId,
) => {
    try {
        const mainBuildingHealth = 200;
        const buildingSize = { width: 96, height: 64 };
        const position = { x: 8, y: 8 };
        switch (color) {
            case PlayerColor.RED:
                break;
            case PlayerColor.BLUE:
                position.x = mapSize - 8;
                position.y = mapSize - 8;
                break;
            case PlayerColor.YELLOW:
                position.x = mapSize - 8;
                break;
            case PlayerColor.PURPLE:
                position.y = mapSize - 8;
                break;
            default:
                break;
        }
        const mainBuilding = new BuildingModel({
            position,
            color,
            gameId,
            health: mainBuildingHealth,
            buildingType: "main",
            size: buildingSize,
        });
        const savedMain = await mainBuilding.save();
        return savedMain;
    } catch (err) {
        console.error(err);
    }
};
