import {
    Attackable,
    Building,
    BuildingController,
    BuildingUpdateData,
    GameEntity,
    GameState,
    GameUpdateData,
    MainBuilding,
    Player,
    Resource,
    ResourceController,
    ResourceUpdateData,
    Unit,
    UnitController,
    UnitData,
    UnitUpdateData,
    Worker,
} from "@packages/game-data/dist";
import { PlayerCommand } from "../../types";
import { createUnit } from "@packages/game-db/dist";
import { mapMongoUnitToData } from "../../utils/parseData";

const UNIT_CONSTRUCTION_COST = {
    warrior: { food: 20, wood: 20 },
    worker: { food: 20, wood: 0 },
    archer: { food: 30, wood: 30 },
} as const;
type UnitType = keyof typeof UNIT_CONSTRUCTION_COST;

class EntityController {
    private unitController: UnitController;
    private buildingController: BuildingController;
    private resourceController: ResourceController;
    private createdUnits: Set<UnitData>;
    private gameId: string;

    constructor(
        unitController: UnitController,
        buildingController: BuildingController,
        resourceController: ResourceController,
        gameId: string,
    ) {
        this.unitController = unitController;
        this.buildingController = buildingController;
        this.resourceController = resourceController;
        this.createdUnits = new Set();
        this.gameId = gameId;
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

    async handlePlayerCommand(command: PlayerCommand, player: Player) {
        const entity = this.unitController.getUnitById(command.entityId);
        switch (command.action) {
            case "mining":
                this.handleMiningCommand(entity, command);
                break;
            case "train":
                await this.handleTrainingUnit(command, player);
                break;
            case "moving":
                this.handleMovingCommand(entity, command);
                break;
            case "attack":
                this.handleAttackCommand(entity, command);
                break;
            default:
                console.error("Invalid command", command);
                break;
        }
    }

    private async handleTrainingUnit(command: PlayerCommand, player: Player) {
        const mainBuilding = this.buildingController.getBuildingById(
            command.entityId,
        );
        if (mainBuilding instanceof MainBuilding && command.unitType) {
            const { wood, food } = player.getResources();
            const unitType = command.unitType as UnitType;
            const cost = UNIT_CONSTRUCTION_COST[unitType];
            if (cost.food > food || cost.wood > wood) return;

            player.spendFood(cost.food);
            player.spendWood(cost.wood);

            const data = mainBuilding.createUnit(command.unitType);
            const savedUnit = await createUnit(
                this.gameId,
                data.spawnX,
                data.spawnY,
                data.color,
                command.unitType,
            );
            if (savedUnit) {
                const unitData = mapMongoUnitToData(savedUnit);
                this.createdUnits.add(unitData);
            }
        }
    }

    private handleMiningCommand(entity: Unit | null, command: PlayerCommand) {
        if (!command.targetId) return;
        const targetResource = this.resourceController.getResourceById(
            command.targetId,
        );
        if (entity instanceof Worker && targetResource) {
            entity.collector.collectResource(targetResource);
        }
    }

    private handleMovingCommand(entity: Unit | null, command: PlayerCommand) {
        if (
            entity instanceof Unit &&
            typeof command.targetX === "number" &&
            typeof command.targetY === "number"
        ) {
            if (entity instanceof Worker) {
                entity.resetTargetResource();
            }
            entity.setAttackableTarget(null);
            entity.setStatus("moving");
            entity.setupPathfinder(
                entity.getX(),
                entity.getY(),
                command.targetX,
                command.targetY,
            );
        }
    }

    private handleAttackCommand(entity: Unit | null, command: PlayerCommand) {
        if (!(entity instanceof Unit) || !command.targetId) return;
        let targetEntity: Attackable | null | undefined =
            this.unitController.getUnitById(command.targetId) ||
            this.buildingController.getBuildingById(command.targetId);

        if (targetEntity) {
            entity.setAttackableTarget(targetEntity);
        }
    }
}

export default EntityController;
