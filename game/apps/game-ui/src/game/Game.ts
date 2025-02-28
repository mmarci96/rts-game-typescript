import { GameMap, Tile } from "@packages/game-data";
import AssetManager from "./data/AssetManager";

class Game {
    static WIDTH = window.innerWidth;
    static HEIGHT = window.innerHeight;

    constructor(assets: AssetManager, tiles: Tile[][]) {}
}

export default Game;
