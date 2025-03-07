import { Tile, GameState, Player, PlayerResources } from "@packages/game-data";
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
import { Command } from "../../main";
import Overlay from "../ui/Overlay";

class GameLogic {
    static CAMERA_SIZE = Math.round(window.innerWidth / 32);
    running: boolean = false;
    #player: Player;
    #camera: Camera;
    #gameMapDrawer: GameMapDrawer;
    #assets: AssetManager;
    #keyEventHandler: KeyEventHandler;
    #mouseEventHandler: MouseEventHandler;
    #gameCanvas: GameCanvas;
    #entityManager: EntityManager;

    constructor(assets: AssetManager, tiles: Tile[][], currentPlayer: Player) {
        this.#player = currentPlayer;
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
        this.#gameCanvas = new GameCanvas();

        this.#gameMapDrawer.drawMap();
        this.#keyEventHandler = new KeyEventHandler(this.#camera);
        this.#keyEventHandler.setupCameraControl(this.#gameMapDrawer);

        this.#mouseEventHandler = new MouseEventHandler(
            this.#player,
            this.#camera,
            new SelectionBox(),
            this.#assets,
            new Overlay(),
        );

        this.#entityManager = new EntityManager(this.#assets);
    }
    updateGameState(data: GameState) {
        this.#entityManager.loadGameState(data);
    }
    updatePlayerState(playerResources: PlayerResources) {
        this.#player.setResources(playerResources);
        Overlay.statusBar.setResource("food", playerResources.food);
        Overlay.statusBar.setResource("wood", playerResources.wood);
    }

    startGameLoop(createCommand: (commands: Command[]) => void) {
        this.running = true;
        const ctx: CanvasRenderingContext2D | null =
            this.#gameCanvas.getContext();
        if (!ctx) {
            throw new Error("Fuck my like");
        }
        this.#entityManager.loadDrawableEntities(ctx, this.#assets);

        this.#mouseEventHandler.addCanvasEventListeners(
            this.#entityManager.getDrawables().values(),
            createCommand,
        );

        let lastTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            ctx.clearRect(0, 0, Game.WIDTH, Game.HEIGHT);
            this.#entityManager.refreshEntities(deltaTime);

            [...this.#entityManager.getDrawables().values()].forEach(
                (drawable: Drawable) => {
                    drawable.draw(ctx, this.#camera);
                },
            );
            Overlay.statusBar.setFps(deltaTime * 1000);

            requestAnimationFrame(animate);
        };

        animate();
    }
    getPlayerColor() {
        return this.#player.getColor()
    }
}

export default GameLogic;
