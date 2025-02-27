import { Player } from "@packages/game-data";
import { PlayerColor } from "@packages/game-data/dist/data/types";
import { GameEntityData, IMap } from "@packages/game-db";

class Game {
    #id;
    #players: Map<string, Player>;
    constructor(gameId: string, map: IMap, gameData: GameEntityData) {
        this.#id = gameId;
        this.#players = new Map();
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
}

export default Game;
