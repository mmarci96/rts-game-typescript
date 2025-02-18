import { Position } from "../types";

class GameEntity {
    #id
    #position
    #description

    /**
    * @param id string
    * @param position Position
    */
    constructor(id: string, position: Position, description: string | undefined) {
        this.#id = id;
        this.#position = position;
        this.#description = description || 'No info';
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
        return this.#position.x
    }

    /**
    * @returns number
    */
    getY() {
        return this.#position.y
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
        return this.#description
    }

}

export default GameEntity;
