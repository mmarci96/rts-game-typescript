import { Tile } from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import { BuildingData, ResourceData, UnitData } from "@packages/game-data";
import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import KeyEventHandler from "../control/KeyEventHandler";

export interface GameState {
    units: UnitData[];
    resources: ResourceData[];
    buildings: BuildingData[];
}

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
    #camera;
    #gameMapDrawer;
    #assets;
    #keyEventHandler;
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
        this.#gameMapDrawer.drawMap();
        this.#keyEventHandler = new KeyEventHandler(this.#camera);
        this.#keyEventHandler.setupCameraControl(this.#gameMapDrawer);
    }
}

export default GameLogic;
