import { GameMap, Tile } from "@packages/game-data";
import AssetManager from "./data/AssetManager";
import GameLogic from "./logic/GameLogic";

class Game {
    static WIDTH = window.innerWidth;
    static HEIGHT = window.innerHeight;
    #gameLogic;

    constructor(assets: AssetManager, tiles: Tile[][]) {
        this.#gameLogic = new GameLogic(assets, tiles);
    }
}

export default Game;
