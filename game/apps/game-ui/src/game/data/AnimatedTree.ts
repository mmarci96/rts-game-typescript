import { GameEntity } from "@packages/game-data/dist";
import AnimatedSprite from "./AnimatedSprite";

class AnimatedTree extends AnimatedSprite {
    constructor(sprite: CanvasImageSource, entity: GameEntity) {
        super(sprite, entity);
        this.frameWidth = 768 / 4;
        this.frameHeight = 576 / 3;
        this.frameY = 0;
        this.maxFrame = 3;
    }
    setAnimationType(state: string) {
        switch (state) {
            case "log":
                this.frameY = 2;
                this.maxFrame = 0;
                break;
            case "falling":
                this.frameY = 1;
                break;
            default:
                this.frameY = 0;
                break;
        }
    }
}

export default AnimatedTree;
