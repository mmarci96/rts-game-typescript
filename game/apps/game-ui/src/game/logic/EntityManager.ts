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
            this.#unitController.removeUnit(entityId);
            this.#drawables.delete(entityId)
            console.log("Entity removed", entityId);
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

        this.#unitController.getUnits().forEach((unit: Unit) => {
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
                existingKeys.delete(drawable.entity.getId());
            }
        });
        [...existingKeys].forEach((unitId: string) => {
            const unit = this.#unitController.getUnitById(unitId);
            console.log(unit);

            if (unit) {
                const animatedSprite = this.loadAnimatedUnit(unit);
                this.#drawables.set(unit.getId(), animatedSprite);
            }
        });
    }
    loadAnimatedUnit(unit: Unit) {
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
        try {
            const units = this.getUnitsController().getUnits();
            const buildings = this.getBuildingController().getBuildings();
            const resources = this.getResourceController().getResources();
            if (!ctx) {
                return;
            }
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
                        drawable.setShadow(true)
                        this.#drawables.set(resource.getId(), drawable);
                        break;
                }
            });

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

        } catch (err) {
            console.error(err);
        }
    }
}

export default EntityManager;
