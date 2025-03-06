import { Player, GameState } from "@packages/game-data";
import { PlayerColor } from "@packages/game-data/dist/data/types";
import { IMap, IPlayer } from "@packages/game-db";
import GameLogic from "./logic/GameLogic";

class Game {
    #id;
    #gameLogic;

    constructor(gameId: string, map: IMap, gameData: GameState) {
        this.#id = gameId;
        this.#gameLogic = new GameLogic(gameId, gameData, map);
    }

    addPlayer(playerData: IPlayer) {
        this.#gameLogic.addPlayer(playerData);
    }
    removePlayer(playerId: string) {
        this.#gameLogic.removePlayer(playerId);
    }
    getPlayers() {
        this.#gameLogic.getPlayers();
    }

    getId() {
        return this.#id;
    }
    getLogic() {
        return this.#gameLogic;
    }
    isGameOver() {
        return false;
    }
}

export default Game;
