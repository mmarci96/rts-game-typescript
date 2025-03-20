import { Player, Tile } from "@packages/game-data";
import AssetManager from "./data/AssetManager";
import GameLogic from "./logic/GameLogic";
import { PlayerData } from "../types";

class Game {
    static WIDTH = window.innerWidth;
    static HEIGHT = window.innerHeight;
    #gameLogic;

    constructor(
        assets: AssetManager,
        tiles: Tile[][],
        player: PlayerData,
        gameId: string,
    ) {
        const currentPlayer = new Player(
            player.id,
            player.color,
            gameId,
        );
        this.#gameLogic = new GameLogic(assets, tiles, currentPlayer);
    }
    getLogic() {
        return this.#gameLogic;
    }
}

export default Game;
