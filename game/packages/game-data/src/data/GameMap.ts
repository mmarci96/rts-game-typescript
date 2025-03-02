import { Tile } from "./types";

class GameMap {
    static TILE_WIDTH = 48;
    static TILE_HEIGHT = 24;
    #tiles;

    constructor(tiles: Tile[][]) {
        this.#tiles = tiles;
    }

    getTiles() {
        return [...this.#tiles];
    }
}

export default GameMap;
