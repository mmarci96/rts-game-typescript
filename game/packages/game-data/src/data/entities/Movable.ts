import { IMovable, Tile } from "../types";
import { AStar } from "../utils/pathfinding";

class Movable implements IMovable {
    #speed: number;
    #targetX: number | null;
    #targetY: number | null;
    #currentX: number;
    #currentY: number;
    #aStar: AStar | null;
    #path: Tile[]

    constructor(speed: number, currentX: number, currentY: number, aStar: AStar | null) {
        this.#speed = speed;
        this.#targetX = null;
        this.#targetY = null;
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
        const currentTile = this.#aStar.getTile(startX, startY);
        const targetTile = this.#aStar.getTile(targetX, targetY);
        const path = this.#aStar.search(currentTile, targetTile);
        this.#path = path;
        //console.log(path);
        return path;
    }

    getTarget() {
        return {
            targetX: this.#targetX,
            targetY: this.#targetY,
        };
    }

    move(startX: number, startY: number, deltaTime: number) {
        if (!this.#targetX || !this.#targetY) {
            return { newX: startX, newY: startY, progress: "completed" };
        }
        const deltaX = this.#targetX - startX;
        const deltaY = this.#targetY - startY;
        const distanceToTarget = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const speed = this.#speed / 4;
        const stepDistance = speed * deltaTime;
        if (distanceToTarget <= stepDistance) {
            this.#targetX = null;
            this.#targetY = null;
            return { newX: startX, newY: startY, progress: "completed" };
        }

        const directionX = deltaX / distanceToTarget;
        const directionY = deltaY / distanceToTarget;

        const newX = startX + directionX * stepDistance;
        const newY = startY + directionY * stepDistance;

        return { newX, newY, progress: "progressing" };
    }
    getSpeed() {
        return this.#speed;
    }
}

export default Movable;
