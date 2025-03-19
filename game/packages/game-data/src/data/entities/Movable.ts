import { IMovable, Tile } from "../types";
import { AStar } from "../utils/pathfinding";

class Movable implements IMovable {
    #speed: number;
    #targetX: number | null;
    #targetY: number | null;
    #currentX: number;
    #currentY: number;
    #aStar: AStar | null;
    #finalX: number;
    #finalY: number;
    #path: Tile[]

    constructor(speed: number, currentX: number, currentY: number, aStar: AStar | null) {
        this.#speed = speed;
        this.#targetX = null;
        this.#targetY = null;
        this.#finalX = currentX;
        this.#finalY = currentY;
        this.#currentX = currentX;
        this.#currentY = currentY
        this.#aStar = aStar;
        this.#path = [];
    }

    setTarget(targetX: number | null, targetY: number | null) {
        this.#targetY = targetY;
        this.#targetX = targetX;
    }

    setupPathfinder(startX: number, startY: number, targetX: number, targetY: number) {
        if (!this.#aStar) {
            console.error("Pathfinder not initialized!");
            return [];
        }
        this.#finalX = targetX;
        this.#finalY = targetY;
        const currentTile = this.#aStar.getTile(startX, startY);
        const targetTile = this.#aStar.getTile(targetX, targetY);
        const path = this.#aStar.search(currentTile, targetTile);
        this.#path = path;
        return path;
    }

    getTarget() {
        return {
            targetX: this.#targetX,
            targetY: this.#targetY,
        };
    }

    move(deltaTime: number) {
        if (this.#path.length === 0) {
            return { newX: this.#currentX, newY: this.#currentY, progress: "completed" };
        }

        const nextTile = this.#path[0];
        const deltaX = nextTile.x - this.#currentX;
        const deltaY = nextTile.y - this.#currentY;
        const distanceToNextTile = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const speed = this.#speed / 4;
        const stepDistance = speed * deltaTime;

        if (distanceToNextTile <= stepDistance) {
            this.#currentX = (this.#currentX + nextTile.x) / 2;
            this.#currentY = (this.#currentY + nextTile.y) / 2;

            if (Math.abs(this.#currentX - nextTile.x) < 0.01 && Math.abs(this.#currentY - nextTile.y) < 0.01) {
                this.#currentX = this.#finalX;
                this.#currentY = this.#finalY;
                this.#path.shift();
            }
        } else {
            const directionX = deltaX / distanceToNextTile;
            const directionY = deltaY / distanceToNextTile;
            this.#currentX += directionX * stepDistance;
            this.#currentY += directionY * stepDistance;
            this.#targetX = nextTile.x;
            this.#targetY = nextTile.y;
        }

        return {
            newX: this.#currentX,
            newY: this.#currentY,
            progress: this.#path.length === 0 ? "completed" : "progressing"
        };
    }

    getSpeed() {
        return this.#speed;
    }
}

export default Movable;
