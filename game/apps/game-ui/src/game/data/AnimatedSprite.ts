import { Unit } from "@packages/game-data";
import Camera from "../ui/Camera";
import VectorTransformer from "../utils/VectorTransformer";
import Drawable from "./Drawable";

class AnimatedSprite extends Drawable {
    spriteSheet: CanvasImageSource;
    frameWidth: number;
    frameHeight: number;
    frameX: number;
    frameY: number;
    gameFrame: number;
    staggerFrames: number;
    maxFrame: number;
    skullFrames: number;
    isAnimationComplete: boolean;

    constructor(spriteSheet: CanvasImageSource) {
        super(spriteSheet);
        this.spriteSheet = spriteSheet;
        this.frameWidth = 1152 / 6;
        this.frameHeight = 1536 / 8;
        this.frameX = 0;
        this.frameY = 0;
        this.gameFrame = 0;
        this.staggerFrames = 6; // requestAnimationFrame(60FPS)/ 6 = 10 FPS
        this.maxFrame = 5;
        this.skullFrames = 0;
        this.isAnimationComplete = false;
    }

    //draw(ctx: CanvasRenderingContext2D, camera: Camera, gameEntity: Unit) {}

    updateAnimation() {
        //if (this.isDying && this.maxFrame === 6) {
        //    if (this.skullFrames >= 7) {
        //        this.frameY = 1;
        //        this.isAnimationComplete = true; // Mark animation as complete
        //    } else {
        //        this.skullFrames++;
        //    }
        //}
        if (this.gameFrame % this.staggerFrames === 0) {
            this.frameX < this.maxFrame ? this.frameX++ : (this.frameX = 0);
        }
        this.gameFrame++;
    }

    draw(context: CanvasRenderingContext2D, camera: Camera, unit: Unit) {
        this.updateAnimation();
        if (!this.spriteSheet) {
            console.error("Sprite sheet not loaded");
            return;
        }
        const isVisible = this.checkOutOfBounds(
            camera,
            unit.getX(),
            unit.getY(),
        );

        if (!isVisible) {
            return;
        }
        const { px, py } = VectorTransformer.positionToCanvas(
            unit.getX(),
            unit.getY(),
            camera.getX(),
            camera.getY(),
        );

        if (unit) {
            this.drawSelector(context, px, py);
        }

        context.drawImage(
            this.spriteSheet,
            this.frameX * this.frameWidth,
            this.frameY * this.frameHeight,
            this.frameWidth,
            this.frameHeight,
            px - 64,
            py - 64,
            128,
            128,
        );
    }

    setAnimationType(state: string) {
        switch (state) {
            case "moving":
                this.frameY = 1;
                break;
            case "idle":
                this.frameY = 0;
                break;
            case "cooldown":
                this.frameY = 2;
                break;
            case "attackLeft1":
                this.frameY = 2;
                break;
            case "attackLeft2":
                this.frameY = 3;
                break;
            case "attackDown1":
                this.frameY = 4;
                break;
            case "attackDown2":
                this.frameY = 5;
                break;
            case "attackUp1":
                this.frameY = 6;
                break;
            case "attackUp2":
                this.frameY = 7;
                break;
            case "dead":
                this.frameY = 0;
                break;
            case "delete":
                this.frameY = 1;
                break;
            default:
                this.frameY = 0;
                break;
        }
    }
}
export default AnimatedSprite;
