import {
    Tile,
    GameState,
    UnitController,
    Resource,
    Building,
    Unit,
    GameEntity,
} from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import KeyEventHandler from "../control/KeyEventHandler";
import GameCanvas from "../ui/GameCanvas";
import EntityManager from "./EntityManager";
import Game from "../Game";
import Drawable from "../data/Drawable";
import AnimatedSprite from "../data/AnimatedSprite";

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
    #camera: Camera;
    #gameMapDrawer: GameMapDrawer;
    #assets: AssetManager;
    #keyEventHandler: KeyEventHandler;
    #gameCanvas: GameCanvas;
    #entityManager: EntityManager;

    constructor(assets: AssetManager, tiles: Tile[][]) {
        this.#camera = new Camera(
            16,
            16,
            GameLogic.CAMERA_SIZE,
            GameLogic.CAMERA_SIZE,
        );
        this.#assets = assets;
        this.#gameMapDrawer = new GameMapDrawer(
            tiles,
            this.#camera,
            this.#assets,
        );
        this.#gameCanvas = new GameCanvas(this.#camera);

        this.#gameMapDrawer.drawMap();
        this.#keyEventHandler = new KeyEventHandler(this.#camera);
        this.#keyEventHandler.setupCameraControl(this.#gameMapDrawer);

        this.#entityManager = new EntityManager();
    }
    updateGameState(data: GameState) {
        //console.log(data);
        this.#entityManager.loadGameState(data);
    }

    gameLoop() {
        const units = this.#entityManager.getUnitsController().getUnits();
        const buildings = this.#entityManager
            .getBuildingController()
            .getBuildings();
        const resources = this.#entityManager
            .getResourceController()
            .getResources();
        const ctx = this.#gameCanvas.getContext();

        if (!ctx) {
            throw new Error("KK");
        }

        const drawables = new Map<Drawable, GameEntity>();

        // Add units to drawables
        units.forEach((unit: Unit) => {
            const color = unit.getColor();
            const img = this.#assets.getImage(
                `${unit.getType().toLowerCase()}_${color}`,
            );
            console.log(img, `${unit.getType()}_${color}`);

            if (!img) {
                throw new Error("not found");
            }
            const animatedSprite = new AnimatedSprite(img);
            drawables.set(animatedSprite, unit);
        });

        // Add buildings to drawables
        buildings.forEach((building: Building) => {
            const color = building.getColor();
            const img = this.#assets.getImage(`house_${color.toLowerCase()}`);
            if (!img) {
                throw new Error("not found");
            }
            const drawable = new Drawable(img);
            drawables.set(drawable, building);
        });

        // Add resources to drawables
        resources.forEach((resource: Resource) => {
            let img = this.#assets.getImage(resource.getType());
            if (resource.getType() === "tree") {
                img = this.#assets.getImage("directional_sign");
            }
            if (!img) {
                throw new Error("not found");
            }
            const drawable = new Drawable(img);
            drawables.set(drawable, resource);
        });

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

            drawables.forEach((value: GameEntity, key: Drawable) => {
                key.draw(ctx, this.#camera, value);
                if (key instanceof AnimatedSprite) {
                    key.updateAnimation();
                }
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}

export default GameLogic;
