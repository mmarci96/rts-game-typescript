import {
    Building,
    GameEntity,
    GameState,
    GameUpdateData,
    Player,
    Resource,
    ResourceUpdateData,
    BuildingUpdateData,
    Unit,
    UnitData,
    UnitUpdateData,
} from "@packages/game-data/dist";
import BuildingController from "./BuildingController";
import ResourceController from "./ResourceController";
import UnitController from "./UnitController";

class EntityController {
    private unitController: UnitController;
    private buildingController: BuildingController;
    private resourceController: ResourceController;
    private createdUnits: Set<UnitData>;

    constructor(
        unitController: UnitController,
        buildingController: BuildingController,
        resourceController: ResourceController,
    ) {
        this.unitController = unitController;
        this.buildingController = buildingController;
        this.resourceController = resourceController;
        this.createdUnits = new Set();
    }

    loadEntities(data: GameState) {
        this.buildingController.loadBuildings(data.buildings);
        this.resourceController.loadResources(data.resources);
        this.unitController.loadUnits(data.units);
    }

    refreshEntities(deltaTime: number) {
        this.unitController.refreshUnits(deltaTime);
        this.buildingController.refreshBuilding(deltaTime);
        this.resourceController.updateResources();
    }

    loadMinedResources(player: Player) {
        return this.unitController.getMinedResources(player);
    }

    loadCreatedUnit(data: UnitData) {
        this.unitController.loadUnit(data);
    }

    getCreatedUnits(): UnitData[] {
        return [...this.createdUnits.values()];
    }

    emptyCreatedUnits() {
        this.createdUnits.clear();
    }

    addCreatedUnit(data: UnitData) {
        this.createdUnits.add(data);
    }

    getEntityUpdateData(): GameUpdateData {
        const unitUpdateData: UnitUpdateData[] = this.unitController
            .getUnits()
            .flatMap(
                (unit: Unit): UnitUpdateData => ({
                    id: unit.getId(),
                    position: unit.getPosition(),
                    health: unit.getHealth(),
                    state: unit.getStatus(),
                }),
            );
        const buildingUpdateData: BuildingUpdateData[] = this.buildingController
            .getBuildings()
            .flatMap(
                (building: Building): BuildingUpdateData => ({
                    id: building.getId(),
                    health: building.getHealth(),
                }),
            );
        const resourceUpdateData: ResourceUpdateData[] = this.resourceController
            .getResources()
            .flatMap(
                (resource: Resource): ResourceUpdateData => ({
                    id: resource.getId(),
                    availableResource: resource.getAvailableResource(),
                }),
            );
        return {
            unitUpdateData,
            buildingUpdateData,
            resourceUpdateData,
        };
    }

    getEntityById(id: string): GameEntity | null {
        const unit = this.unitController.getUnitById(id);
        if (unit) {
            return unit;
        }
        const building = this.buildingController.getBuildingById(id);
        if (building) {
            return building;
        }
        const resource = this.resourceController.getResourceById(id);
        if (resource) {
            return resource;
        }
        return null;
    }

    getUnitById(id: string): Unit | null {
        const unit = this.unitController.getUnitById(id);
        if (!unit) {
            return null;
        }
        return unit;
    }

    getBuildingById(id: string): Building | null {
        const building = this.buildingController.getBuildingById(id);
        if (!building) {
            return null;
        }
        return building;
    }

    getResourceById(id: string): Resource | null {
        const resource = this.resourceController.getResourceById(id);
        if (!resource) {
            return null;
        }
        return resource;
    }

    getUnits(): Unit[] {
        return this.unitController.getUnits();
    }

    getBuildings(): Building[] {
        return this.buildingController.getBuildings();
    }

    getResources(): Resource[] {
        return this.resourceController.getResources();
    }

    getEntities() {
        const entities: GameEntity[] = [
            ...this.unitController.getUnits(),
            ...this.buildingController.getBuildings(),
            ...this.resourceController.getResources(),
        ];
        return entities;
    }
}

export default EntityController;
