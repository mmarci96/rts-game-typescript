import {
    UnitController,
    BuildingController,
    ResourceController,
    GameState,
    GameEntity,
    Unit,
    Building,
    Resource,
    ResourceType,
} from "@packages/game-data";
import Drawable from "../data/Drawable";
import AssetManager from "../data/AssetManager";
import AnimatedSprite from "../data/AnimatedSprite";
import AnimatedTree from "../data/AnimatedTree";

class EntityManager {
    #unitController: UnitController;
    #buildingController: BuildingController;
    #resourceController: ResourceController;
    #drawables: Map<GameEntity, Drawable>;

    constructor() {
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();
        this.#drawables = new Map<GameEntity, Drawable>();
    }

    loadGameState(gameState: GameState) {
        console.log(gameState);
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
    getDrawableEntities(ctx: CanvasRenderingContext2D, assets: AssetManager) {
        this.loadDrawableEntities(ctx, assets);
        return this.#drawables;
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
            const animatedSprite = new AnimatedSprite(img);
            this.#drawables.set(unit, animatedSprite);
        });

        buildings.forEach((building: Building) => {
            const color = building.getColor();
            const img = assets.getImage(`house_${color.toLowerCase()}`);
            if (!img) {
                throw new Error("not found");
            }
            const drawable = new Drawable(img);
            this.#drawables.set(building, drawable);
        });

        resources.forEach((resource: Resource) => {
            const img = assets.getImage(resource.getType());
            if (!img) {
                throw new Error("not found");
            }
            switch (resource.getType()) {
                case ResourceType.TREE:
                    const tree = new AnimatedTree(img);
                    this.#drawables.set(resource, tree);
                    break;
                default:
                    const drawable = new Drawable(img);
                    this.#drawables.set(resource, drawable);
                    break;
            }
        });
    }
}

export default EntityManager;
