import {
    GameMap,
    UnitController,
    ResourceController,
    GameState,
    BuildingController,
} from "@packages/game-data";
import { IMap } from "@packages/game-db";
import EntityController from "./EntityController";

class GameLogic {
    #entityController: EntityController;
    #gameMap;

    constructor(gameData: GameState, gameMap: IMap) {
        const unitController = new UnitController();
        const resourceController = new ResourceController();
        const buildingController = new BuildingController();
        this.#entityController = new EntityController(
            unitController,
            buildingController,
            resourceController,
        );

        this.loadData(gameData);
        this.#gameMap = new GameMap(gameMap.tiles);
    }

    loadData(data: GameState) {
        this.#entityController.loadEntities(data);
    }

    updateGameState(deltaTime: number) {
        //TODO refresh states and pass the updater forward
        this.#entityController.refreshEntities(deltaTime);
    }
}

export default GameLogic;
