import { Position, Size } from "../types";

class GameEntity {
    #id;
    #position;
    #description;
    #size;

    /**
     * @param id string
     * @param position Position
     */
    constructor(
        id: string,
        position: Position,
        description: string,
        size: Size,
    ) {
        this.#id = id;
        this.#position = position;
        this.#description = description || "No info";
        this.#size = size;
    }

    /**
     * @returns string
     */
    getId() {
        return this.#id;
    }

    /**
     * @returns Position
     */
    getPosition() {
        return this.#position;
    }

    /**
     * @returns number
     */
    getX() {
        return this.#position.x;
    }

    /**
     * @returns number
     */
    getY() {
        return this.#position.y;
    }

    /**
     * @param position Position
     */
    setPosition(position: Position) {
        this.#position = position;
    }

    /**
     * @param x number
     */
    setX(x: number) {
        this.#position.x = x;
    }

    /**
     * @param y number
     */
    setY(y: number) {
        this.#position.y = y;
    }

    /**
     * @returns string
     */
    getDescription() {
        return this.#description;
    }

    getSize() {
        return this.#size;
    }
    getType() {
        return "entity";
    }
}

export default GameEntity;
