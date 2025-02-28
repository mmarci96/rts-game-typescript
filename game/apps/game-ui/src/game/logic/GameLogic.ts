import {
    Tile,
    GameState,
    UnitController,
    Resource,
    Building,
    Unit,
    GameEntity,
    ResourceType,
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
import AnimatedTree from "../data/AnimatedTree";

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
        this.#entityManager.loadGameState(data);
    }

    gameLoop() {
        const ctx: CanvasRenderingContext2D | null =
            this.#gameCanvas.getContext();
        if (!ctx) {
            throw new Error("Fuck my like");
        }

        const drawables = this.#entityManager.getDrawableEntities(
            ctx,
            this.#assets,
        );

        const animate = () => {
            ctx.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

            drawables.forEach((value: Drawable, key: GameEntity) => {
                value.draw(ctx, this.#camera, key);
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}

export default GameLogic;
