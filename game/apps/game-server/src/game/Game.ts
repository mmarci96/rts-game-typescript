import { GameState } from "@packages/game-data";
import { IMap } from "@packages/game-db";
import GameLogic from "./logic/GameLogic";

class Game {
    #id;
    #gameLogic;

    constructor(gameId: string, map: IMap, gameData: GameState) {
        this.#id = gameId;
        this.#gameLogic = new GameLogic(gameId, gameData, map);
    }
    getId() {
        return this.#id;
    }
    getLogic() {
        return this.#gameLogic;
    }
    isGameOver() {
        return this.#gameLogic.isGameOver();
    }
}

export default Game;
