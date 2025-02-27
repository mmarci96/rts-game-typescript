import { GameMap, Size } from "@packages/game-data";
import { GameEntityData, IMap, IUnit } from "@packages/game-db";
import UnitController from "./UnitController";

class GameLogic {
    #unitController;
    #gameMap;

    constructor(gameData: GameEntityData, gameMap: IMap) {
        this.#unitController = new UnitController();
        this.loadUnits(gameData.units);
        const size: Size = {
            width: gameMap.tiles.length,
            height: gameMap.tiles.length,
        };
        this.#gameMap = new GameMap(gameMap.tiles, size);
    }

    loadUnits(units: IUnit[]) {
        this.#unitController.loadUnits(units);
    }
}

export default GameLogic;
