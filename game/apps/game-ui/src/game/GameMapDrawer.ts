import { Tile } from "@packages/game-data";
import Camera from "./ui/Camera";
import VectorTransformer from "./utils/VectorTransformer";

class GameMapDrawer {
    #tiles
    constructor(tiles: Tile[][], camera: Camera) {
        this.#tiles = tiles;
    }
}


export default GameMapDrawer;
