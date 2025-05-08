import GameMapDrawer from "../GameMapDrawer";
import Camera from "../ui/Camera";
import Minimap from "../ui/Minimap";

class KeyEventHandler {
    private camera;
    constructor(camera: Camera) {
        this.camera = camera;
    }

    setupCameraControl(gameMap: GameMapDrawer, minimap: Minimap) {
        const setupMovementListeners = (callbacks: any) => {
            const {
                onUp = () => {},
                onDown = () => {},
                onLeft = () => {},
                onRight = () => {},
            } = callbacks;

            // Keydown event listener
            const handleKeydown = (event: KeyboardEvent) => {
                switch (event.key) {
                    case "w":
                    case "ArrowUp":
                        onUp();
                        break;
                    case "s":
                    case "ArrowDown":
                        onDown();
                        break;
                    case "a":
                    case "ArrowLeft":
                        onLeft();
                        break;
                    case "d":
                    case "ArrowRight":
                        onRight();
                        break;
                    default:
                        // Do nothing for other keys
                        break;
                }
            };

            document.addEventListener("keydown", handleKeydown);

            return () => {
                document.removeEventListener("keydown", handleKeydown);
            };
        };

        const enforceBounds = (cameraX: number, cameraY: number) => {
            const { mapWidth, mapHeight } = gameMap.getMapSize();

            const minX = 0;
            const maxX = mapWidth;
            const minY = 0;
            const maxY = mapHeight;

            const clampedX = Math.max(minX, Math.min(cameraX, maxX));
            const clampedY = Math.max(minY, Math.min(cameraY, maxY));

            this.camera.setPosition(clampedX, clampedY);
        };

        const onDown = () => {
            this.camera.moveCamera(1, 1);
            enforceBounds(this.camera.getX(), this.camera.getY());
            minimap.drawMinimap();
            gameMap.drawMap();
        };
        const onRight = () => {
            this.camera.moveCamera(1, -1);
            enforceBounds(this.camera.getX(), this.camera.getY());
            minimap.drawMinimap();
            gameMap.drawMap();
        };
        const onLeft = () => {
            this.camera.moveCamera(-1, 1);
            enforceBounds(this.camera.getX(), this.camera.getY());
            minimap.drawMinimap();
            gameMap.drawMap();
        };
        const onUp = () => {
            this.camera.moveCamera(-1, -1);
            enforceBounds(this.camera.getX(), this.camera.getY());
            minimap.drawMinimap();
            gameMap.drawMap();
        };
        setupMovementListeners({ onUp, onDown, onLeft, onRight });
    }
}

export default KeyEventHandler;
