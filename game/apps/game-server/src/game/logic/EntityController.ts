import {
    Building,
    BuildingController,
    ControlledEntity,
    GameEntity,
    GameState,
    MainBuilding,
    Player,
    PlayerColor,
    Resource,
    ResourceController,
    Unit,
    UnitController,
    Worker,
} from "@packages/game-data";
import { PlayerCommand } from "../../types";
import { createUnit } from "@packages/game-db";
import { mapMongoUnitToData } from "../../utils/parseData";

const UNIT_CONSTRUCTION_COST = {
    warrior: { food: 10, wood: 10 },
    worker: { food: 10, wood: 0 },
    archer: { food: 15, wood: 20 },
} as const;
type UnitType = keyof typeof UNIT_CONSTRUCTION_COST;

class EntityController {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;
    #gameId: string;

    constructor(
        unitController: UnitController,
        buildingController: BuildingController,
        resourceController: ResourceController,
        gameId: string,
    ) {
        this.#unitController = unitController;
        this.#buildingController = buildingController;
        this.#resourceController = resourceController;
        this.#gameId = gameId;
    }

    loadEntities(data: GameState) {
        this.#buildingController.loadBuildings(data.buildings);
        this.#resourceController.loadResources(data.resources);
        this.#unitController.loadUnits(data.units);
    }

    getUnits(): Unit[] {
        return this.#unitController.getUnits();
    }
    getBuildings(): Building[] {
        return this.#buildingController.getBuildings();
    }
    getResources(): Resource[] {
        return this.#resourceController.getResources();
    }

    getEntities() {
        const entities: GameEntity[] = [
            ...this.#unitController.getUnits(),
            ...this.#buildingController.getBuildings(),
            ...this.#resourceController.getResources(),
        ];
        return entities;
    }

    async handlePlayerCommand(command: PlayerCommand, player: Player) {
        const entity = this.#unitController.getUnitById(command.entityId);
        if (entity instanceof ControlledEntity) {
            entity.setStatus(command.action);
        }
        switch (command.action) {
            case "mining":
                if (!command.targetId) {
                    break;
                }
                const worker = this.#unitController.getUnitById(command.entityId);
                const targetResource = this.#resourceController.getResourceById(command.targetId);
                if (worker &&
                    worker instanceof Worker &&
                    targetResource) {
                    worker.collector.collectResource(targetResource);
                }
                break;
            case "train":
                const mainBuilding = this.#buildingController.getBuildingById(
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
                        this.#gameId,
                        data.spawnX,
                        data.spawnY,
                        data.color,
                        command.unitType,
                    );
                    if (savedUnit) {
                        const unitData = mapMongoUnitToData(savedUnit);
                        this.#unitController.loadUnit(unitData);
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
                    entity.attacker.resetTarget();
                }
                break;
            case "attack":
                if (entity instanceof Unit && command.targetId) {
                    this.handleAttackEntity(entity, command.targetId);
                }
                break;
            default:
                console.log("Invalid command", command);
                break;
        }
    }

    getEnemyUnits(playerColor: PlayerColor) {
        return this.#unitController.getEnemyUnits(playerColor);
    }

    handleMovingUnit(unit: Unit, targetX: number, targetY: number) {
        unit.movable.setTarget(targetX, targetY);
    }

    handleAttackEntity(unit: Unit, targetId: string) {
        unit.attacker.setTargetId(targetId);
        this.#unitController
            .getUnitById(unit.getId())
            ?.attacker.setTargetId(targetId);
    }

    refreshEntities(deltaTime: number) {
        this.#unitController.refreshUnits(deltaTime);
        this.#buildingController.refreshBuilding(deltaTime);

    }
    loadMinedResources(player: Player) {
        const mining = this.#unitController.getMinedResources(player);
        return mining;
    }
    checkWinner(): PlayerColor | undefined {
        return this.#unitController.checkWinner();
    }
}

export default EntityController;
