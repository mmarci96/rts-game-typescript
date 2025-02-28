import {
    GameMap,
    UnitController,
    ResourceController,
    BuildingController,
} from "@packages/game-data";
import { IMap } from "@packages/game-db";
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

        this.#gameMap = new GameMap(gameMap.tiles);
    }

    loadData(data: GameState) {
        this.#buildingController.loadBuildings(data.buildings);
        this.#resourceController.loadResources(data.resources);
        this.#unitController.loadUnits(data.units);
    }
}

export default GameLogic;
