import { GameEntity, Unit } from "@packages/game-data";
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
    isDying: boolean;

    constructor(spriteSheet: CanvasImageSource, entity: GameEntity) {
        super(spriteSheet, entity);
        this.spriteSheet = spriteSheet;
        this.frameWidth = 1152 / 6;
        this.frameHeight = 1536 / 8;
        this.frameX = 0;
        this.frameY = 0;
        this.gameFrame = 0;
        this.staggerFrames = 7;
        this.maxFrame = 5;
        this.skullFrames = 0;
        this.isAnimationComplete = false;
        this.isDying = false;
    }

    updateAnimation() {
        if (this.isDying && this.maxFrame === 6) {
            if (this.skullFrames >= 7) {
                this.frameY = 1;
                this.isAnimationComplete = true;
            } else {
                this.skullFrames++;
            }
        }
        if (this.gameFrame % this.staggerFrames === 0) {
            this.frameX < this.maxFrame ? this.frameX++ : (this.frameX = 0);
        }
        this.gameFrame++;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        this.updateAnimation();
        if (!this.spriteSheet) {
            console.error("Sprite sheet not loaded");
            return;
        }
        const isVisible = this.checkOutOfBounds(
            camera,
            this.entity.getX(),
            this.entity.getY(),
        );

        if (!isVisible) {
            return;
        }

        const { px, py } = VectorTransformer.positionToCanvas(
            this.entity.getX(),
            this.entity.getY(),
            camera.getX(),
            camera.getY(),
        );

        if (this.isSelected) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, 32, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
            ctx.fill();
            ctx.closePath();
            ctx.restore();
        }

        ctx.drawImage(
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

    move(targetX: number, targetY: number, deltaTime: number) {
        const x = this.entity.getX();
        const y = this.entity.getY();
        if (!(this.entity instanceof Unit)) {
            return { x, y };
        }
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = this.entity.movable.getSpeed() / 4;
        const stepDistance = speed * deltaTime;
        if (distance <= stepDistance) {
            return { x, y };
        }
        const nx = dx / distance;
        const ny = dy / distance;

        const tx = x + nx * stepDistance;
        const ty = y + ny * stepDistance;

        return { x: tx, y: ty };
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
                this.frameY = 0;
                break;
            case "attack":
                this.frameY = 3;
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
            case "mining":
                this.frameY = 3;
                break;
            default:
                this.frameY = 0;
                break;
        }
    }
    setDeathAnimation(deathSprite: CanvasImageSource) {
        this.staggerFrames = 12;
        this.skullFrames = 0;
        this.maxFrame = 6;
        this.frameWidth = 896 / 7;
        this.frameHeight = 256 / 2;
        this.spriteSheet = deathSprite;
    }

    /**
     * @returns number
     */
    getSkullFrames() {
        return this.skullFrames;
    }
}
export default AnimatedSprite;
