import {
    GameState,
    mapUnitToUnitParams,
    UnitData,
    Archer,
    Warrior,
    Worker,
    Unit,
    BuildingData,
    MainBuilding,
    mapBuildingToBuildingParams,
    Building,
    ResourceData,
    mapResourceToResourceParams,
    WheatField,
    Tree,
    Resource,
    ResourceType,
    GameUpdateData,
} from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import Drawable from "../data/Drawable";
import AnimatedSprite from "../data/AnimatedSprite";
import AnimatedTree from "../data/AnimatedTree";

class EntityManager {
    private drawables: Map<string, Drawable>;
    private assets: AssetManager;

    constructor(assets: AssetManager) {
        this.assets = assets;
        this.drawables = new Map<string, Drawable>();
    }

    loadEntities(data: GameState) {
        const { units, buildings, resources } = data;
        units.forEach((unitData) => this.loadUnit(unitData));
        buildings.forEach((buildingData) => this.loadBuilding(buildingData));
        resources.forEach((resourceData) => this.loadResource(resourceData));
    }

    getDrawableEntities(): Drawable[] {
        return [...this.drawables.values()];
    }

    updateEntities(data: GameUpdateData) {
        const existingKeys = new Set(this.drawables.keys());
        const { unitUpdateData, buildingUpdateData, resourceUpdateData } = data;
        unitUpdateData.forEach((unitUpdate) => {
            const unit = this.drawables.get(unitUpdate.id);
            if (!unit || !(unit.entity instanceof Unit)) {
                console.error("Error updating unit: ", unitUpdate.id);
                return;
            }
            unit.entity.handleUpdateData(unitUpdate);
            existingKeys.delete(unitUpdate.id);
        });
        buildingUpdateData.forEach((buildingUpdate) => {
            const building = this.drawables.get(buildingUpdate.id);
            if (!building || !(building.entity instanceof Building)) {
                console.error("Error updating building: ", buildingUpdate.id);
                return;
            }
            building.entity.setHealth(buildingUpdate.health);
            existingKeys.delete(buildingUpdate.id);
        });
        resourceUpdateData.forEach((resourceUpdate) => {
            const resource = this.drawables.get(resourceUpdate.id);
            if (!resource || !(resource.entity instanceof Resource)) {
                console.error("Error updating resource: ", resourceUpdate);
                return;
            }
            resource.entity.setAvailableResource(
                resourceUpdate.availableResource,
            );
            existingKeys.delete(resourceUpdate.id);
        });
        [...existingKeys].forEach((entityId: string) => {
            const entity = this.drawables.get(entityId);
            if (entity instanceof AnimatedSprite) {
                this.handleDeath(entity);
            } else {
                this.drawables.delete(entityId);
            }
        });
    }

    handleDeath(animatedSprite: AnimatedSprite) {
        if (animatedSprite.isAnimationComplete) {
            this.drawables.delete(animatedSprite.entity.getId());
            return;
        }
        if (animatedSprite.entity instanceof Unit && !animatedSprite.isDying) {
            animatedSprite.isDying = true;
            const deathSprite = this.assets.getImage("dead");
            if (!deathSprite) {
                console.error("No deathsprite found");
                return;
            }
            animatedSprite.setDeathAnimation(deathSprite);
        }
    }

    loadResource(resourceData: ResourceData) {
        let resource;
        const resourceParams = mapResourceToResourceParams(resourceData);
        switch (resourceData.resourceType) {
            case "wheatfield":
                resource = new WheatField(resourceParams);
                break;
            case "tree":
                resource = new Tree(resourceParams);
                break;
            case "wheat":
                resource = new WheatField(resourceParams);
                break;
            default:
                break;
        }
        if (resource) {
            try {
                this.loadDrawableEntity(resource);
            } catch (err) {
                console.error(err);
            }
        }
    }

    loadUnit(unitData: UnitData) {
        let unit;
        const unitParam = mapUnitToUnitParams(unitData);
        switch (unitData.unitType) {
            case "archer":
                unit = new Archer(unitParam, null);
                break;
            case "worker":
                unit = new Worker(unitParam, null);
                break;
            case "warrior":
                unit = new Warrior(unitParam, null);
                break;
            default:
                console.error("Error loading unit:", unitData);
                break;
        }
        if (unit) {
            try {
                this.loadDrawableEntity(unit);
            } catch (err) {
                console.error(err);
            }
        }
    }

    loadBuilding(buildingData: BuildingData) {
        let building;
        const buildingParams = mapBuildingToBuildingParams(buildingData);
        switch (buildingData.buildingType) {
            case "main":
                building = new MainBuilding(buildingParams);
                break;
            default:
                console.error("Error loading building: ", buildingData);
                break;
        }
        if (building) {
            try {
                this.loadDrawableEntity(building);
            } catch (err) {
                console.error(err);
            }
        }
    }

    private loadDrawableEntity(entity: Resource | Building | Unit): void {
        let drawable: Drawable | AnimatedSprite | undefined;
        let key: string;
        switch (true) {
            case entity instanceof Unit: {
                const unit = entity as Unit;
                const spriteName = `${unit.getType().toLowerCase()}_${unit.getColor()}`;
                const img = this.assets.getImage(spriteName);
                if (!img) throw new Error("Image not found");
                drawable = new AnimatedSprite(img, unit);
                key = unit.getId();
                break;
            }
            case entity instanceof Building: {
                const building = entity as Building;
                const img = this.assets.getImage(
                    `house_${building.getColor().toLowerCase()}`,
                );
                if (!img) throw new Error("Image not found");
                drawable = new Drawable(img, building);
                key = building.getId();
                break;
            }
            case entity instanceof Resource: {
                const resource = entity as Resource;
                const img = this.assets.getImage(resource.getType());
                if (!img) throw new Error("Image not found");
                key = resource.getId();
                switch (resource.getType()) {
                    case ResourceType.TREE:
                        drawable = new AnimatedTree(img, resource);
                        break;
                    default:
                        drawable = new Drawable(img, resource);
                        drawable.setShadow(true);
                        break;
                }
                break;
            }
            default:
                throw new Error("Unknown entity type");
        }
        if (drawable && key) {
            this.drawables.set(key, drawable);
        }
    }
}

export default EntityManager;
