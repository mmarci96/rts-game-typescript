import {
    Tile,
    GameState,
    Player,
    PlayerResources,
    GameUpdateData,
    UnitData,
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
import { Command } from "../../types";
import Overlay from "../ui/Overlay";

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
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
        this.camera = new Camera(
            16,
            16,
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
        if (!ctx) throw new Error("No canvas");
        this.mouseEventHandler.addCanvasEventListeners(createCommand);

        let lastTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            ctx.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);

            this.mouseEventHandler.updateDrawables(
                this.entityManager.getDrawableEntities(),
            );

            this.entityManager
                .getDrawableEntities()
                .forEach((drawable: Drawable) => {
                    drawable.draw(ctx, this.camera);
                });
            Overlay.statusBar.setFps(deltaTime * 1000);
            requestAnimationFrame(animate);
        };
        animate();
    }

    getPlayerColor() {
        return this.player.getColor();
    }
}

export default GameLogic;
