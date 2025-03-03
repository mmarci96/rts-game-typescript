class Movable {
    #speed: number;
    #targetX: number | null;
    #targetY: number | null;

    constructor(speed: number) {
        this.#speed = speed;
        this.#targetX = null;
        this.#targetY = null;
    }

    setTarget(targetX: number, targetY: number) {
        this.#targetY = targetY;
        this.#targetX = targetX;
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
}

export default Movable;
