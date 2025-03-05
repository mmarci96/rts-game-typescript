import {
    Building,
    BuildingController,
    ControlledEntity,
    GameEntity,
    GameState,
    MainBuilding,
    ResourceController,
    Unit,
    UnitController,
} from "@packages/game-data";
import { PlayerCommand } from "../../types";

class EntityController {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;

    constructor(
        unitController: UnitController,
        buildingController: BuildingController,
        resourceController: ResourceController,
    ) {
        this.#unitController = unitController;
        this.#buildingController = buildingController;
        this.#resourceController = resourceController;
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
        return this.#buildingController.getBuildings()
    }

    getEntities() {
        const entities: GameEntity[] = [
            ...this.#unitController.getUnits(),
            ...this.#buildingController.getBuildings(),
            ...this.#resourceController.getResources(),
        ];
        return entities;
    }

    handlePlayerCommand(command: PlayerCommand) {
        const entity = this.#unitController.getUnitById(command.entityId);
        if (entity instanceof ControlledEntity) {
            entity.setStatus(command.action);
        }
        switch (command.action) {
            case "train":
                if (entity instanceof MainBuilding && command.unitType) {
                    const addUnit = (unit: Unit) => this.#unitController.addUnit(unit)
                    entity.createUnit(command.unitType, addUnit);
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
}

export default EntityController;
