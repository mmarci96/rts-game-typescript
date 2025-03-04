import {
    BuildingController,
    GameEntity,
    GameState,
    ResourceController,
    UnitController,
} from "@packages/game-data";

class EntityController {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;
    #entities: Map<string, GameEntity>;

    constructor(
        unitController: UnitController,
        buildingController: BuildingController,
        resourceController: ResourceController,
    ) {
        this.#entities = new Map<string, GameEntity>();
        this.#unitController = unitController;
        this.#buildingController = buildingController;
        this.#resourceController = resourceController;
    }

    loadEntities(data: GameState) {
        this.#buildingController.loadBuildings(data.buildings);
        this.#resourceController.loadResources(data.resources);
        this.#unitController.loadUnits(data.units);
    }

    getEntities() {
        this.#entities.values();
    }

    refreshEntities(deltaTime: number) {
        this.#unitController.refreshUnits(deltaTime);
    }
}

export default EntityController;
