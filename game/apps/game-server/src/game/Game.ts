import { GameState } from "@packages/game-data/dist";
import { IMap, IPlayer } from "@packages/game-db/dist";
import GameLogic from "./logic/GameLogic";

class Game {
    private id;
    private gameLogic;
    public lastUpdateTime: number = 0;

    constructor(
        gameId: string,
        map: IMap,
        gameData: GameState,
        players: IPlayer[],
    ) {
        this.id = gameId;
        this.gameLogic = new GameLogic(gameId, gameData, map, players);
    }
    getId() {
        return this.id;
    }
    getLogic() {
        return this.gameLogic;
    }
    isGameOver() {
        return this.gameLogic.isGameOver();
    }
}

export default Game;
