import {
    Tile,
    GameState,
    Player,
    PlayerResources,
    GameUpdateData,
    UnitData,
    Command,
} from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import KeyEventHandler from "../control/KeyEventHandler";
import GameCanvas from "../ui/GameCanvas";
import EntityManager from "./EntityManager";
import Game from "../Game";
import Drawable from "../data/Drawable";
import MouseEventHandler from "../control/MouseEventHandler";
import SelectionBox from "../ui/SelectionBox";
import Overlay from "../ui/Overlay";

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
    static DELTA_TIME = Date.now();
    running: boolean = false;
    private player: Player;
    private camera: Camera;
    private gameMapDrawer: GameMapDrawer;
    private assets: AssetManager;
    private keyEventHandler: KeyEventHandler;
    private mouseEventHandler: MouseEventHandler;
    private gameCanvas: GameCanvas;
    private entityManager: EntityManager;

    constructor(assets: AssetManager, tiles: Tile[][], currentPlayer: Player) {
        this.player = currentPlayer;
        const cameraStartPosition = { x: 16, y: 16 };

        if (this.player.getColor() === "blue") {
            const camOffSet = Math.sqrt(tiles.length * tiles[0].length);
            cameraStartPosition.x = camOffSet - 16;
            cameraStartPosition.y = camOffSet - 16;
        }

        this.camera = new Camera(
            cameraStartPosition.x,
            cameraStartPosition.y,
            GameLogic.CAMERA_SIZE,
            GameLogic.CAMERA_SIZE,
        );
        this.assets = assets;
        this.gameMapDrawer = new GameMapDrawer(tiles, this.camera, this.assets);
        this.gameCanvas = new GameCanvas();

        this.gameMapDrawer.drawMap();
        this.keyEventHandler = new KeyEventHandler(this.camera);
        this.keyEventHandler.setupCameraControl(this.gameMapDrawer);

        this.mouseEventHandler = new MouseEventHandler(
            this.player,
            this.camera,
            new SelectionBox(),
            this.assets,
            new Overlay(),
        );

        this.entityManager = new EntityManager(this.assets);
    }
    loadGameState(data: GameState) {
        this.entityManager.loadEntities(data);
    }
    updateEntities(data: GameUpdateData) {
        this.entityManager.updateEntities(data);
    }
    handleUnitCreated(data: UnitData) {
        this.entityManager.loadUnit(data);
    }
    updatePlayerState(playerResources: PlayerResources) {
        this.player.setResources(playerResources);
        Overlay.statusBar.setResource("food", playerResources.food);
        Overlay.statusBar.setResource("wood", playerResources.wood);
    }

    startGameLoop(createCommand: (commands: Command[]) => void) {
        this.running = true;
        const context = this.gameCanvas.getContext();
        const ctx: CanvasRenderingContext2D | null = context;
        this.mouseEventHandler.addCanvasEventListeners(createCommand);

        let lastTime = Date.now();
        const animate = () => {
            const now = Date.now();
            GameLogic.DELTA_TIME = (now - lastTime) / 1000;
            lastTime = now;
            ctx!.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

            const drawables = this.entityManager.getDrawableEntities();
            this.mouseEventHandler.updateDrawables(drawables);
            drawables.forEach((drawable: Drawable) => {
                drawable.draw(ctx!, this.camera);
            });
            Overlay.statusBar.setFps();
            requestAnimationFrame(animate);
        };
        animate();
    }

    getPlayerColor() {
        return this.player.getColor();
    }
}

export default GameLogic;
