import {
    UnitController,
    BuildingController,
    ResourceController,
    GameState,
    Unit,
    Building,
    Resource,
    ResourceType,
    UnitData,
} from "@packages/game-data";
import Drawable from "../data/Drawable";
import AssetManager from "../data/AssetManager";
import AnimatedSprite from "../data/AnimatedSprite";
import AnimatedTree from "../data/AnimatedTree";

class EntityManager {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;
    #drawables: Map<string, Drawable>;

    constructor() {
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();
        this.#drawables = new Map<string, Drawable>();
    }

    loadGameState(gameState: GameState) {
        //console.log(gameState);
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
    getDrawables() {
        return this.#drawables;
    }

    refreshEntities(deltaTime: number) {
        this.#unitController.getUnits().forEach((unit: Unit) => {
            const drawable = this.#drawables.get(unit.getId());
            if (
                drawable &&
                drawable.entity instanceof Unit &&
                drawable instanceof AnimatedSprite
            ) {
                const currentX = drawable.entity.getX()
                const currentY = drawable.entity.getY()
                const tx = unit.movable.getTarget().targetX
                const ty = unit.movable.getTarget().targetY
                if (tx && ty) {
                    const dx = tx - currentX
                    const dy = ty - currentY
                    const distance = Math.sqrt(dx ** 2 + dy ** 2);
                    if (distance < 0.2) {
                        console.log(distance);
                    } else {
                        const { x, y } = drawable.move(tx, ty, deltaTime);
                        unit.setX(x);
                        unit.setY(y);
                        drawable.entity = unit;
                    }
                }
                drawable.updateAnimation();
            }
        });
    }
    updateGameState(gameState: GameState) {
        gameState.units.forEach((unitData: UnitData) => {
            const unit = this.#drawables.get(unitData.id);
            if (!unit) {
                return;
            }
            if (unit.entity instanceof Unit && unit instanceof AnimatedSprite) {
                //unit.entity.setStatus(unitData.state);
                //console.log(unitData.state);

                unit.setAnimationType(unitData.state);

                //unit.entity.movable.setTarget(
                //    unitData.target.x,
                //    unitData.target.y,
                //);
                //const targetId = unitData.target.id?.toString();
                //if (targetId) {
                //    unit.entity.attacker.setTargetId(targetId);
                //}
            }
        });
    }

    loadDrawableEntities(ctx: CanvasRenderingContext2D, assets: AssetManager) {
        const units = this.getUnitsController().getUnits();
        const buildings = this.getBuildingController().getBuildings();
        const resources = this.getResourceController().getResources();
        if (!ctx) {
            throw new Error("KK");
        }
        units.forEach((unit: Unit) => {
            const color = unit.getColor();
            const img = assets.getImage(
                `${unit.getType().toLowerCase()}_${color}`,
            );
            if (!img) {
                throw new Error("not found");
            }
            const animatedSprite = new AnimatedSprite(img, unit);
            this.#drawables.set(unit.getId(), animatedSprite);
        });

        buildings.forEach((building: Building) => {
            const color = building.getColor();
            const img = assets.getImage(`house_${color.toLowerCase()}`);
            if (!img) {
                throw new Error("not found");
            }
            const drawable = new Drawable(img, building);
            this.#drawables.set(building.getId(), drawable);
        });

        resources.forEach((resource: Resource) => {
            const img = assets.getImage(resource.getType());
            if (!img) {
                throw new Error("not found");
            }
            switch (resource.getType()) {
                case ResourceType.TREE:
                    const tree = new AnimatedTree(img, resource);
                    this.#drawables.set(resource.getId(), tree);
                    break;
                default:
                    const drawable = new Drawable(img, resource);
                    this.#drawables.set(resource.getId(), drawable);
                    break;
            }
        });
    }
}

export default EntityManager;
