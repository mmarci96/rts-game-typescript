import { GameEntity } from "@packages/game-data";
import Camera from "../ui/Camera";
import VectorTransformer from "../utils/VectorTransformer";

class Drawable {
    #spriteSheet: CanvasImageSource;
    isSelected: boolean;
    #hasShadow: boolean;

    constructor(spriteSheet: CanvasImageSource) {
        this.#spriteSheet = spriteSheet;
        this.isSelected = false;
        this.#hasShadow = false;
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
        if (gameEntity.isSelected) {
            console.log("wtf");
            this.drawSelector(ctx, px, py, 96);
        }
        if (this.#hasShadow) {
            this.drawShadow(ctx, px, py);
        }
        //console.log("Game entitt Height: ", gameEntity.getSize().height);

        ctx.drawImage(this.#spriteSheet, px, py);
    }

    drawSelector(
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        radius: number = 122,
    ) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
            x,
            y,
            radius,
            0,
            Math.PI * 2, // Full circle
        );
        ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    drawShadow(ctx: CanvasRenderingContext2D, px: number, py: number) {
        const shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        ctx.moveTo(px + 32, py); // Top center
        ctx.lineTo(px + 64, py + 16); // Right top
        ctx.lineTo(px + 64, py + 48); // Right bottom
        ctx.lineTo(px + 32, py + 64); // Bottom center
        ctx.lineTo(px, py + 48); // Left bottom
        ctx.lineTo(px, py + 16); // Left top
        ctx.closePath();
        ctx.fill();
    }

    setShadow(val: boolean) {
        this.#hasShadow = val;
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
