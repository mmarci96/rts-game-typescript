import { Player, GameState } from "@packages/game-data";
import { PlayerColor } from "@packages/game-data/dist/data/types";
import { IMap } from "@packages/game-db";
import GameLogic from "./logic/GameLogic";

class Game {
    #id;
    #players: Map<string, Player>;
    #gameLogic;

    constructor(gameId: string, map: IMap, gameData: GameState) {
        this.#id = gameId;
        this.#players = new Map();
        this.#gameLogic = new GameLogic(gameId, gameData, map);
    }

    addPlayer(playerId: string, color: PlayerColor) {
        const player = new Player(playerId, color);
        this.#players.set(player.getId(), player);
    }
    removePlayer(playerId: string) {
        this.#players.delete(playerId);
    }
    getPlayers() {
        return [...this.#players.values()];
    }

    getId() {
        return this.#id;
    }
    getLogic() {
        return this.#gameLogic;
    }
    isGameOver() {
        let over = false;
        const colors = [...this.#players.values()].flatMap((player: Player) =>
            player.getColor(),
        );
        colors.forEach(
            (color: PlayerColor) => (over = this.#gameLogic.isGameOver(color)),
        );
        return over;
    }
}

export default Game;
