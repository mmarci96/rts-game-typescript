import { PlayerColor } from "./types"

class Player {
    #playerId
    #color

    /**
    * @param { string } playerId
    * @param { string } color
    */
    constructor(playerId: string, color: PlayerColor) {
        this.#playerId = playerId
        this.#color = color
    }

    /**
    * @returns PlayerColor 
    */
    getColor() {
        return this.#color
    }

    /**
    * @returns string
    */
    getId() {
        return this.#playerId
    }

}

export default Player;
