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

    constructor() {
        this.#unitController = new UnitController();
        this.#resourceController = new ResourceController();
        this.#buildingController = new BuildingController();
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

    getDrawableEntities(
        ctx: CanvasRenderingContext2D,
        assets: AssetManager,
    ): Map<GameEntity, Drawable> {
        const drawables = new Map<GameEntity, Drawable>();
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
            drawables.set(unit, animatedSprite);
        });

        buildings.forEach((building: Building) => {
            const color = building.getColor();
            const img = assets.getImage(`house_${color.toLowerCase()}`);
            if (!img) {
                throw new Error("not found");
            }
            const drawable = new Drawable(img);
            drawables.set(building, drawable);
        });

        resources.forEach((resource: Resource) => {
            const img = assets.getImage(resource.getType());
            if (!img) {
                throw new Error("not found");
            }
            switch (resource.getType()) {
                case ResourceType.TREE:
                    const tree = new AnimatedTree(img);
                    drawables.set(resource, tree);
                    break;
                default:
                    const drawable = new Drawable(img);
                    drawables.set(resource, drawable);
                    break;
            }
        });
        return drawables;
    }
}

export default EntityManager;
