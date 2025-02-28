import { GameEntity } from "@packages/game-data";
import Camera from "../ui/Camera";
import VectorTransformer from "../utils/VectorTransformer";
import Game from "../Game";

class Drawable {
    #spriteSheet: CanvasImageSource;
    constructor(spriteSheet: CanvasImageSource) {
        this.#spriteSheet = spriteSheet;
    }
    draw(
        ctx: CanvasRenderingContext2D,
        camera: Camera,
        gameEntity: GameEntity,
    ) {
        const isVisible = this.checkOutOfBounds(
            camera,
            gameEntity.getX(),
            gameEntity.getY(),
        );
        if (!isVisible) {
            return;
        }
        const { px, py } = VectorTransformer.positionToCanvas(
            gameEntity.getX(),
            gameEntity.getY(),
            camera.getX(),
            camera.getY(),
        );
        ctx.fillRect(px, py, 64, 64);
        ctx.drawImage(this.#spriteSheet, px, py);
    }

    checkOutOfBounds(camera: Camera, x: number, y: number) {
        const minX = camera.getX() - camera.getWidth();
        const maxX = camera.getX() + camera.getWidth();
        const minY = camera.getY() - camera.getHeight();
        const maxY = camera.getY() + camera.getHeight();

        return !(minY > y || minX > x || maxY < y || maxX < x);
    }
}

export default Drawable;
