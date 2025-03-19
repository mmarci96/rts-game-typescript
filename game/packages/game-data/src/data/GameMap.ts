import { Tile } from "./types";

class GameMap {
    static TILE_WIDTH = 48;
    static TILE_HEIGHT = 24;
    #tiles;

    constructor(tiles: Tile[][]) {
        this.#tiles = tiles;
        this.#setupMap(tiles)

    }

    #setupMap(tiles: Tile[][]) {
        for (let y = 0; y < tiles.length; y++) {
            const row: Tile[] = tiles[y];
            for (let x = 0; x < row.length; x++) {
                const tile: Tile = row[x];
                tile.x = x;
                tile.y = y;

            }

        }
    }

    getTiles() {
        return [...this.#tiles];
    }
}

export default GameMap;
