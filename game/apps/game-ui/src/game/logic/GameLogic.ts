import { Tile, GameState, UnitController } from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import KeyEventHandler from "../control/KeyEventHandler";
import GameCanvas from "../ui/GameCanvas";

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
    #camera;
    #gameMapDrawer;
    #assets;
    #keyEventHandler;
    #gameCanvas;
    #unitController;

    constructor(assets: AssetManager, tiles: Tile[][]) {
        this.#camera = new Camera(
            16,
            16,
            GameLogic.CAMERA_SIZE,
            GameLogic.CAMERA_SIZE,
        );
        this.#unitController = new UnitController();
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
    }
    updateGameState(data: GameState) {
        console.log(data);
    }
}

export default GameLogic;
