import {
    UnitController,
    BuildingController,
    ResourceController,
    GameState,
} from "@packages/game-data";

class EntityManager {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;

    constructor() {
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();
    }

    loadGameState(gameState: GameState) {
        console.log(gameState);
        this.#unitController.loadUnits(gameState.units);
        this.#buildingController.loadBuildings(gameState.buildings);
        this.#resourceController.loadResources(gameState.resources);
    }
    getUnitsController() {
        return this.#unitController;
    }
    getBuildingController() {
        return this.#buildingController;
    }
    getResourceController() {
        return this.#resourceController;
    }
}

export default EntityManager;
