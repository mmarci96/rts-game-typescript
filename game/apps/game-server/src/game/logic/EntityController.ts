import {
    Attackable,
    Building,
    BuildingController,
    BuildingUpdateData,
    ControlledEntity,
    GameEntity,
    GameState,
    GameUpdateData,
    MainBuilding,
    Player,
    PlayerColor,
    Resource,
    ResourceController,
    ResourceUpdateData,
    Unit,
    UnitController,
    UnitUpdateData,
    Worker,
} from "@packages/game-data/dist";
import { PlayerCommand } from "../../types";
import { createUnit } from "@packages/game-db/dist";
import { mapMongoUnitToData } from "../../utils/parseData";

const UNIT_CONSTRUCTION_COST = {
    warrior: { food: 10, wood: 10 },
    worker: { food: 10, wood: 0 },
    archer: { food: 15, wood: 20 },
} as const;
type UnitType = keyof typeof UNIT_CONSTRUCTION_COST;

class EntityController {
    private unitController: UnitController;
    private buildingController: BuildingController;
    private resourceController: ResourceController;
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
        this.gameId = gameId;
    }

    loadEntities(data: GameState) {
        this.buildingController.loadBuildings(data.buildings);
        this.resourceController.loadResources(data.resources);
        this.unitController.loadUnits(data.units);
    }

    getEntityUpdateData(): GameUpdateData {
        const unitUpdateData: UnitUpdateData[] = this.unitController
            .getUnits()
            .flatMap(
                (unit: Unit): UnitUpdateData => ({
                    id: unit.getId(),
                    position: unit.getPosition(),
                    health: unit.getHealth(),
                    target: unit.getTarget(),
                    state: unit.getStatus(),
                }),
            );
        const buildingUpdateData: BuildingUpdateData[] =
            this.buildingController.getBuildings().flatMap(
                (building: Building): BuildingUpdateData => ({
                    id: building.getId(),
                    health: building.getHealth(),
                    gameId: this.gameId,
                }),
            );
        const resourceUpdateData: ResourceUpdateData[] =
            this.resourceController.getResources().flatMap(
                (resource: Resource): ResourceUpdateData => ({
                    id: resource.getId(),
                    availableResource: resource.getAvailableResource(),
                    gameId: this.gameId,
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
        if (entity instanceof ControlledEntity) {
            entity.setStatus(command.action);
        }
        switch (command.action) {
            case "mining":
                if (!command.targetId) {
                    break;
                }
                const targetResource = this.resourceController.getResourceById(
                    command.targetId,
                );
                if (entity instanceof Worker && targetResource) {
                    entity.collector.collectResource(targetResource);
                }
                break;
            case "train":
                const mainBuilding = this.buildingController.getBuildingById(
                    command.entityId,
                );
                if (mainBuilding instanceof MainBuilding && command.unitType) {
                    const { wood, food } = player.getResources();
                    const unitType = command.unitType as UnitType;
                    const cost = UNIT_CONSTRUCTION_COST[unitType];
                    if (cost.food > food || cost.wood > wood) {
                        return;
                    } else {
                        player.spendFood(cost.food);
                        player.spendWood(cost.wood);
                    }

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
                        this.unitController.loadUnit(unitData);
                    }
                }
            case "moving":
                if (
                    entity instanceof Unit &&
                    command.targetY &&
                    command.targetX
                ) {
                    this.handleMovingUnit(
                        entity,
                        command.targetX,
                        command.targetY,
                    );
                }
                break;
            case "attack":
                if (entity instanceof Unit && command.targetId) {
                    this.handleAttackEntity(entity, command.targetId);
                }
                break;
            default:
                console.error("Invalid command", command);
                break;
        }
    }

    getEnemyUnits(playerColor: PlayerColor) {
        return this.unitController.getEnemyUnits(playerColor);
    }

    handleMovingUnit(unit: Unit, targetX: number, targetY: number) {
        if (unit instanceof Worker) {
            unit.resetTargetResource();
        }
        unit.setAttackableTarget(null);
        unit.setStatus("moving");
        unit.setupPathfinder(unit.getX(), unit.getY(), targetX, targetY);
    }

    handleAttackEntity(unit: Unit, targetId: string) {
        let targetEntity: Attackable | null | undefined =
            this.unitController.getUnitById(targetId);
        if (!targetEntity) {
            targetEntity = this.buildingController.getBuildingById(targetId);
        }
        if (!targetEntity) {
            return;
        }
        unit.setAttackableTarget(targetEntity);
    }

    refreshEntities(deltaTime: number) {
        this.unitController.refreshUnits(deltaTime);
        this.buildingController.refreshBuilding(deltaTime);
        this.resourceController.updateResources();
    }

    loadMinedResources(player: Player) {
        const mining = this.unitController.getMinedResources(player);
        return mining;
    }
}

export default EntityController;
