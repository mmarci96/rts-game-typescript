import {
    BuildingController,
    GameEntity,
    GameState,
    ResourceController,
    Unit,
    UnitController,
} from "@packages/game-data";
import { PlayerCommand } from "../../types";

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
        const entities: GameEntity[] = [
            ...this.#unitController.getUnits(),
            ...this.#buildingController.getBuildings(),
            ...this.#resourceController.getResources(),
        ];
        entities.forEach((entity: GameEntity) => {
            this.#entities.set(entity.getId(), entity);
        });
    }
    getEntityById(id: string) {
        return this.#entities.get(id);
    }

    getEntities() {
        this.#entities.values();
    }

    handlePlayerCommand(command: PlayerCommand) {
        const entity = this.getEntityById(command.entityId);
        console.log(command);
        switch (command.action) {
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
                console.log("Invalid command", command);
                break;
        }
    }

    handleMovingUnit(unit: Unit, targetX: number, targetY: number) {
        unit.movable.setTarget(targetX, targetY);
    }

    handleAttackEntity(unit: Unit, targetId: string) {
        unit.attacker.setTargetId(targetId);
    }

    refreshEntities(deltaTime: number) {
        this.#unitController.refreshUnits(deltaTime);
    }
}

export default EntityController;
