import { Size, Tile } from "./types";

class GameMap {
    static TILE_WIDTH = 48;
    static TILE_HEIGHT = 24;
    #tiles;
    #size;

    constructor(tiles: Tile[], size: Size) {
        this.#tiles = tiles;
        this.#size = size;
    }

    getTiles() {
        return [...this.#tiles];
    }

    getSize() {
        return this.#size;
    }
}

export default GameMap;
