import {
    GameMap,
    UnitController,
    ResourceController,
    GameState,
    BuildingController,
    PlayerColor,
    Player,
} from "@packages/game-data";
import { IMap } from "@packages/game-db";
import EntityController from "./EntityController";
import { PlayerCommand, SaveGameStateParams } from "../../types";

class GameLogic {
    #entityController: EntityController;
    #gameId: string;
    #gameMap;

    constructor(id: string, gameData: GameState, gameMap: IMap) {
        this.#gameId = id;
        const unitController = new UnitController();
        const resourceController = new ResourceController();
        const buildingController = new BuildingController();
        this.#entityController = new EntityController(
            unitController,
            buildingController,
            resourceController,
            this.#gameId,
        );

        this.loadData(gameData);
        this.#gameMap = new GameMap(gameMap.tiles);
    }

    loadData(data: GameState) {
        this.#entityController.loadEntities(data);
    }

    updateGameState(deltaTime: number) {
        this.#entityController.refreshEntities(deltaTime);
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
        //await redisCache.cacheBuildings(
        //    this.#gameId,
        //    this.#entityController.getBuildings(),
        //);
        //await redisCache.cacheResources(
        //    this.#gameId,
        //    this.#entityController.getResources(),
        //);
    }
    isGameOver(playerColor: PlayerColor) {
        console.log("checking game over.", playerColor);
        return false;
    }
}

export default GameLogic;
