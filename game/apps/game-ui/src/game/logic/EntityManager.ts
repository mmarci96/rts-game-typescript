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
    BuildingData,
    ResourceData,
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
    #assets: AssetManager;
    MAX: number = 3;
    current: number = 0;

    constructor(assets: AssetManager) {
        this.#assets = assets;
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();
        this.#drawables = new Map<string, Drawable>();
    }

    loadGameState(gameState: GameState) {
        const { buildings, units, resources } = gameState;
        const existingIds = new Set(this.#drawables.keys());
        this.#unitController.loadUnits(units);
        this.#buildingController.loadBuildings(buildings);
        this.#resourceController.loadResources(resources);
        units.forEach((unitData: UnitData) => existingIds.delete(unitData.id));
        buildings.forEach((buildingData: BuildingData) =>
            existingIds.delete(buildingData.id),
        );
        resources.forEach((resourceData: ResourceData) =>
            existingIds.delete(resourceData.id),
        );
        [...existingIds.keys()].forEach((entityId: string) => {
            const animatedSprite = this.#drawables.get(entityId);
            if (animatedSprite instanceof AnimatedSprite) {
                const img = this.#assets.getImage("dead");
                if (!img) {
                    throw new Error("No image");
                }
                animatedSprite.setDeathAnimation(img);
            }
            if (!(animatedSprite instanceof AnimatedSprite)) {
                this.#drawables.delete(entityId);
                this.#unitController.removeUnit(entityId);
            }
        });
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
        const existingKeys: Set<string> = new Set(
            this.#unitController.getUnitIds(),
        );

        this.#unitController.getUnits().forEach((unit: Unit, i: number) => {
            const drawable = this.#drawables.get(unit.getId());
            if (
                drawable &&
                drawable.entity instanceof Unit &&
                drawable instanceof AnimatedSprite
            ) {
                drawable.setAnimationType(drawable.entity.getStatus());
                const tx = unit.movable.getTarget().targetX;
                const ty = unit.movable.getTarget().targetY;
                if (tx && ty) {
                    const { x, y } = drawable.move(tx, ty, deltaTime);
                    unit.setX(x);
                    unit.setY(y);
                }
                drawable.entity = unit;
                if (i < 2 && this.current < this.MAX) {
                    console.log("Unit:", unit);
                    console.log("drawbleentity", drawable.entity);
                } else {
                    this.current++;
                }
                if (unit.attackable.getHealth() <= 0) {
                    console.log(
                        "A unit should die:",
                        unit.attackable.getHealth(),
                        unit.getId(),
                    );
                }
                existingKeys.delete(drawable.entity.getId());
            }
        });
        [...existingKeys].forEach((unitId: string) => {
            const unit = this.#unitController.getUnitById(unitId);
            if (unit) {
                if (unit.attackable.getHealth() < 4) {
                    console.log(unit);
                }
                const animatedSprite = this.loadUnitDrawable(unit);
                this.#drawables.set(unit.getId(), animatedSprite);
            }
        });
    }
    loadUnitDrawable(unit: Unit) {
        const color = unit.getColor();
        console.log(`${unit.getType().toLowerCase()}_${color}`);

        const img = this.#assets.getImage(
            `${unit.getType().toLowerCase()}_${color}`,
        );
        if (!img) {
            throw new Error("not found");
        }
        const animatedSprite = new AnimatedSprite(img, unit);
        return animatedSprite;
    }

    loadDrawableEntities(ctx: CanvasRenderingContext2D, assets: AssetManager) {
        const units = this.getUnitsController().getUnits();
        const buildings = this.getBuildingController().getBuildings();
        const resources = this.getResourceController().getResources();
        if (!ctx) {
            return;
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
