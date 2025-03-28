import {
    GameMap,
    UnitController,
    ResourceController,
    GameState,
    BuildingController,
    PlayerColor,
    Player,
} from "@packages/game-data/dist";
import { IMap, IPlayer } from "@packages/game-db/dist";
import EntityController from "./EntityController";
import { PlayerCommand, SaveGameStateParams } from "../../types";

class GameLogic {
    #entityController: EntityController;
    #gameId: string;
    #gameMap;
    #players;
    winnerColor: PlayerColor | undefined;

    constructor(
        id: string,
        gameData: GameState,
        gameMap: IMap,
        players: IPlayer[],
    ) {
        this.#gameMap = new GameMap(gameMap.tiles);
        this.#gameId = id;
        const unitController = new UnitController(this.#gameMap);
        const resourceController = new ResourceController();
        const buildingController = new BuildingController();
        this.#entityController = new EntityController(
            unitController,
            buildingController,
            resourceController,
            this.#gameId,
        );

        this.loadData(gameData);
    }

    loadData(data: GameState) {
        this.#entityController.loadEntities(data);
    }

    updateGameState(deltaTime: number) {
        this.#entityController.refreshEntities(deltaTime);
    }

    loadMinedResources(player: Player) {
        return this.#entityController.loadMinedResources(player);
    }

    handlePlayerCommands(commands: PlayerCommand[], player: Player) {
        commands.forEach((command: PlayerCommand) => {
            this.#entityController.handlePlayerCommand(command, player);
        });
    }

    async saveGameState(redisCache: SaveGameStateParams) {
        await redisCache.cacheUnits(
            this.#gameId,
            this.#entityController.getUnits(),
        );
        await redisCache.cacheBuildings(
            this.#gameId,
            this.#entityController.getBuildings(),
        );
        await redisCache.cacheResources(
            this.#gameId,
            this.#entityController.getResources(),
        );
    }
    isGameOver() {
        const winnerColor = this.#entityController.checkWinner();
        if (winnerColor) {
            this.winnerColor = winnerColor;
            return true;
        }
        return false;
    }
    getWinner() {
        return this.winnerColor;
    }
}

export default GameLogic;
