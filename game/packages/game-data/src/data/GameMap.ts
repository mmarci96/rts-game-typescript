import { Building } from "./entities";
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
                if (tile.tileName === "water1") {
                    tile.isPassable = () => false;
                } else {
                    tile.isPassable = () => true;
                }
            }
        }
    }

    addBuildingObsacle(building: Building) {
        const buildingPos = building.getPosition();
        const x = Math.floor(buildingPos.x);
        const y = Math.floor(buildingPos.y);
        const tile = this.#tiles[y][x];
        tile.isPassable = () => false;
    }

    getTiles() {
        return [...this.#tiles];
    }
}

export default GameMap;
