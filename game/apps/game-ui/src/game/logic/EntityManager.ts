import {
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
import UnitManager from "./UnitManager";

class EntityManager {
    private unitManager: UnitManager;
    private buildingController: BuildingController;
    private resourceController: ResourceController;
    private drawables: Map<string, Drawable>;
    private assets: AssetManager;

    constructor(assets: AssetManager) {
        this.assets = assets;
        this.unitManager = new UnitManager();
        this.resourceController = new ResourceController();
        this.buildingController = new BuildingController();
        this.drawables = new Map<string, Drawable>();
    }

    refreshEntities(deltaTime: number) {
        const existingKeys: Set<string> = new Set(
            this.unitManager.getUnitIds(),
        );
        this.unitManager.getUnits().forEach((unit: Unit) => {
            const drawable = this.drawables.get(unit.getId());
            if (
                drawable &&
                drawable.entity instanceof Unit &&
                drawable instanceof AnimatedSprite
            ) {
                drawable.setAnimationType(unit.getStatus());
                const tx = unit.getTarget().targetX;
                const ty = unit.getTarget().targetY;
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
            const unit = this.unitManager.getUnitById(unitId);
            if (unit) {
                const animatedSprite = this.loadAnimatedUnit(unit);
                if (!animatedSprite) {
                    console.error("No animated sprite");
                    return;
                }
                this.drawables.set(unit.getId(), animatedSprite);
            }
        });
    }

    loadGameState(gameState: GameState) {
        const { buildings, units, resources } = gameState;
        const existingIds = new Set(this.drawables.keys());
        this.unitManager.loadUnits(units);
        this.buildingController.loadBuildings(buildings);
        this.resourceController.loadResources(resources);
        units.forEach((unitData: UnitData) => existingIds.delete(unitData.id));
        buildings.forEach((buildingData: BuildingData) =>
            existingIds.delete(buildingData.id),
        );
        resources.forEach((resourceData: ResourceData) =>
            existingIds.delete(resourceData.id),
        );
        [...existingIds.keys()].forEach((entityId: string) => {
            const unit = this.drawables.get(entityId);
            if (unit instanceof AnimatedSprite) {
                this.handleDeath(unit);
            } else {
                this.unitManager.removeUnit(entityId);
                this.drawables.delete(entityId);
                console.log("Entity removed", entityId);
            }
        });
    }

    handleDeath(animatedSprite: AnimatedSprite) {
        if (animatedSprite.isAnimationComplete) {
            this.unitManager.removeUnit(animatedSprite.entity.getId());
            this.drawables.delete(animatedSprite.entity.getId());
            return;
        }
        if (animatedSprite.entity instanceof Unit && !animatedSprite.isDying) {
            animatedSprite.isDying = true;
            const deathSprite = this.assets.getImage("dead");
            if (!deathSprite) return;
            animatedSprite.setDeathAnimation(deathSprite);
        }
    }

    getUnitsController() {
        return this.unitManager;
    }

    getBuildingController() {
        return this.buildingController;
    }

    getResourceController() {
        return this.resourceController;
    }

    getDrawables() {
        return this.drawables;
    }

    loadAnimatedUnit(unit: Unit): AnimatedSprite {
        const spriteName = `${unit.getType().toLowerCase()}_${unit.getColor()}`;
        const img = this.assets.getImage(spriteName);
        if (!img) throw new Error("not found");
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
                if (!img) throw new Error("not found");
                const drawable = new Drawable(img, building);
                this.drawables.set(building.getId(), drawable);
            });

            resources.forEach((resource: Resource) => {
                const img = assets.getImage(resource.getType());
                if (!img) throw new Error("not found");
                switch (resource.getType()) {
                    case ResourceType.TREE:
                        const tree = new AnimatedTree(img, resource);
                        this.drawables.set(resource.getId(), tree);
                        break;
                    default:
                        const drawable = new Drawable(img, resource);
                        drawable.setShadow(true);
                        this.drawables.set(resource.getId(), drawable);
                        break;
                }
            });

            units.forEach((unit: Unit) => {
                const color = unit.getColor();
                const img = assets.getImage(
                    `${unit.getType().toLowerCase()}_${color}`,
                );
                if (!img) throw new Error("not found");
                const animatedSprite = new AnimatedSprite(img, unit);
                this.drawables.set(unit.getId(), animatedSprite);
            });
        } catch (err) {
            console.error(err);
        }
    }
}

export default EntityManager;
