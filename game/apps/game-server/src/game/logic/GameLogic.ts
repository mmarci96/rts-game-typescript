import { GameMap, Size } from "@packages/game-data";
import { GameEntityData, IMap, IUnit } from "@packages/game-db";
import UnitController from "./UnitController";
import ResourceController from "./ResourceController";
import BuildingController from "./BuildingController";
import { GameState } from "../../types";

class GameLogic {
    #unitController;
    #buildingController;
    #resourceController;
    #gameMap;

    constructor(gameData: GameState, gameMap: IMap) {
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();

        this.loadData(gameData);
        const size: Size = {
            width: gameMap.tiles.length,
            height: gameMap.tiles.length,
        };
        this.#gameMap = new GameMap(gameMap.tiles, size);
    }

    loadData(data: GameState) {
        this.#buildingController.loadBuildings(data.buildings);
        this.#resourceController.loadResources(data.resources);
        this.#unitController.loadUnits(data.units);
    }
}

export default GameLogic;
