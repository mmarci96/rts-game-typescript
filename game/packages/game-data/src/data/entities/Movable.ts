import { IMovable, Tile } from "../types";
import { AStar } from "../utils/pathfinding";

class Movable implements IMovable {
    private speed: number;
    private targetX: number | null;
    private targetY: number | null;
    private currentX: number;
    private currentY: number;
    private finalX: number;
    private finalY: number;
    private aStar: AStar | null;
    private path: Tile[]

    constructor(speed: number, currentX: number, currentY: number, aStar: AStar | null) {
        this.speed = speed;
        this.targetX = null;
        this.targetY = null;
        this.currentX = currentX;
        this.currentY = currentY;
        this.finalX = currentX;
        this.finalY = currentY;
        this.aStar = aStar;
        this.path = [];
    }

    setTarget(targetX: number | null, targetY: number | null) {
        this.targetY = targetY;
        this.targetX = targetX;
    }

    setupPathfinder(startX: number, startY: number, targetX: number, targetY: number) {
        if (!this.aStar) {
            console.error("Pathfinder not initialized!");
            return [];
        }
        const currentTile = this.aStar.getTile(startX, startY);
        const targetTile = this.aStar.getTile(targetX, targetY);
        const path = this.aStar.search(currentTile, targetTile);
        this.finalX = targetX;
        this.finalY = targetY;
        this.path = path;
        return path;
    }

    getTarget() {
        return {
            targetX: this.targetX,
            targetY: this.targetY,
        };
    }

    move(deltaTime: number) {
        if (this.path.length === 0) {
            this.currentX = this.finalX;
            this.currentY = this.finalY;
            return { newX: this.currentX, newY: this.currentY, progress: "completed" };
        }

        const nextTile = this.path[0];
        const deltaX = nextTile.x - this.currentX;
        const deltaY = nextTile.y - this.currentY;
        const distanceToNextTile = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const speed = this.speed / 4;
        const stepDistance = speed * deltaTime;

        if (distanceToNextTile <= stepDistance) {
            this.currentX = nextTile.x;
            this.currentY = nextTile.y;
            this.path.shift();
        } else {
            const directionX = deltaX / distanceToNextTile;
            const directionY = deltaY / distanceToNextTile;
            this.currentX += directionX * stepDistance;
            this.currentY += directionY * stepDistance;
        }

        if (this.path.length >= 2) {
            this.targetX = this.path[1].x;
            this.targetY = this.path[1].y;
        } else {
            this.targetX = this.finalX;
            this.targetY = this.finalY;
        }
        return {
            newX: this.currentX,
            newY: this.currentY,
            progress: this.path.length === 0 ? "completed" : "progressing"
        };
    }

    getSpeed() {
        return this.speed;
    }
}

export default Movable;
