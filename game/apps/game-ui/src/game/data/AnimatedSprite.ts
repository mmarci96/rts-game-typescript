import { GameEntity, Unit } from "@packages/game-data";
import Camera from "../ui/Camera";
import VectorTransformer from "../utils/VectorTransformer";
import Drawable from "./Drawable";

class AnimatedSprite extends Drawable {
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
    loopAnimation: boolean;
    isAnimationPlaying: boolean;

    constructor(spriteSheet: CanvasImageSource, entity: GameEntity) {
        super(spriteSheet, entity);
        this.frameWidth = 1152 / 6;
        this.frameHeight = 1536 / 8;
        this.frameX = 0;
        this.frameY = 0;
        this.gameFrame = 0;
        this.staggerFrames = 6;
        this.maxFrame = 5;
        this.skullFrames = 0;
        this.isAnimationComplete = false;
        this.isDying = false;
        this.loopAnimation = true;
        this.isAnimationPlaying = false;
    }

    updateAnimation() {
        if (this.isDying) {
            this.updateDeathAnimation();
        }
        if (this.gameFrame % this.staggerFrames === 0) {
            if (this.loopAnimation) {
                this.frameX = (this.frameX + 1) % (this.maxFrame + 1);
            } else {
                if (this.frameX < this.maxFrame) {
                    this.frameX++;
                } else {
                    this.isAnimationComplete = true;
                    this.isAnimationPlaying = false;
                    this.loopAnimation = true;
                    this.setAnimationType("idle");
                }
            }
        }
        this.gameFrame++;
    }

    updateDeathAnimation() {
        if (this.skullFrames >= 12) {
            this.isAnimationComplete = true;
            return;
        }
        if (this.skullFrames === 6) {
            this.frameY = 1;
        }
        this.skullFrames++;
    }

    draw(ctx: CanvasRenderingContext2D, camera: Camera) {
        if (this.entity instanceof Unit) {
            this.setAnimationType(this.entity.getStatus());
        }
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
        const speed = this.entity.getSpeed() / 4;
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
        if (this.isDying) return;
        if (this.isAnimationPlaying) return;
        switch (state) {
            case "moving":
                this.frameY = 1;
                this.maxFrame = 5;
                this.loopAnimation = true;
                break;
            case "idle":
                this.frameY = 0;
                this.maxFrame = 5;
                this.loopAnimation = true;
                break;
            case "cooldown":
                this.frameY = 0;
                this.maxFrame = 5;
                this.loopAnimation = true;
                break;
            case "attack":
                this.frameY = 3;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "attackLeft1":
                this.frameY = 2;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "attackDown1":
                this.frameY = 4;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "attackDown2":
                this.frameY = 5;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "attackUp1":
                this.frameY = 6;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "attackUp2":
                this.frameY = 7;
                this.maxFrame = 5;
                this.frameX = 0;
                this.loopAnimation = false;
                this.isAnimationPlaying = true;
                break;
            case "dead":
                this.frameY = 0;
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
        this.frameY = 0;
        this.frameX = 0;
        this.skullFrames = 0;
        this.maxFrame = 6;
        this.frameWidth = 896 / 7;
        this.frameHeight = 256 / 2;
        this.spriteSheet = deathSprite;
    }

    getSkullFrames() {
        return this.skullFrames;
    }
}
export default AnimatedSprite;
