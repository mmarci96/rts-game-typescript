import { Tile, GameState, UnitController } from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import KeyEventHandler from "../control/KeyEventHandler";
import GameCanvas from "../ui/GameCanvas";
import EntityManager from "./EntityManager";
import Game from "../Game";

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
        console.log(data);
        this.#entityManager.loadGameState(data);
    }

    gameLoop() {
        const units = this.#entityManager.getUnitsController().getUnits();
        const ctx = this.#gameCanvas.getContext();

        const animate = () => {
            ctx?.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);
            const unit = units[0];
            ctx?.rect(
                unit.getX(),
                unit.getY(),
                unit.getSize().width,
                unit.getSize().height,
            );

            requestAnimationFrame(animate);
        };
        animate();
    }
}

export default GameLogic;
