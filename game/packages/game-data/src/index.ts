interface Position {
    x: number;
    y: number;
}

class GameEntity {
    #x: number;
    #y: number;

    constructor({ x, y }: Position) {
        this.#x = x;
        this.#y = y;
    }

    getPosition() {
        return { x: this.#x, y: this.#y }
    }
}

export { GameEntity }

