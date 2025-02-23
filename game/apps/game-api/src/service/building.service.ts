import { PlayerColor } from "@packages/game-data/dist/data/types"
import { BuildingModel } from "@packages/game-db";
import { Types } from "mongoose";

export const createMainBuilding = async (color: PlayerColor, mapSize: number, gameId: Types.ObjectId) => {
    try {
        const mainBuildingHealth = 200;
        const buildingSize = { width: 128, height: 196 };
        const position = { x: 4, y: 4 };
        switch (color) {
            case PlayerColor.RED:
                break;
            case PlayerColor.BLUE:
                position.x = mapSize - 4;
                position.y = mapSize - 4;
                break;
            case PlayerColor.YELLOW:
                position.x = mapSize - 4;
                break;
            case PlayerColor.PURPLE:
                position.y = mapSize - 4;
                break;
            default:
                break;
        }
        const mainBuilding = new BuildingModel({
            position,
            color,
            gameId,
            health: mainBuildingHealth,
            type: 'main',
            size: buildingSize
        })
        const savedMain = await mainBuilding.save();
        return savedMain;
    } catch (err) {
        console.error(err);

    }
}
