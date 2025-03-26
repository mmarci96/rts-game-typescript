import { GameState } from "@packages/game-data/dist";
import { IMap } from "@packages/game-db/dist";
import GameLogic from "./logic/GameLogic";

class Game {
    #id;
    #gameLogic;
    lastUpdateTime: number = 0;

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
