import {
    GameMap,
    UnitController,
    ResourceController,
    GameState,
    BuildingController,
    Player,
    PlayerColor,
} from "@packages/game-data/dist";
import { IMap, IPlayer } from "@packages/game-db/dist";
import EntityController from "./EntityController";
import { PlayerCommand, SaveGameStateParams } from "../../types";

class GameLogic {
    #entityController: EntityController;
    #gameId: string;
    #gameMap;
    #players: Map<string, Player>;
    #winner: Player | null = null;

    constructor(
        id: string,
        gameData: GameState,
        gameMap: IMap,
        players: IPlayer[],
    ) {
        this.#players = new Map<string, Player>();
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
        this.loadPlayers(players);
    }

    loadData(data: GameState) {
        this.#entityController.loadEntities(data);
    }

    loadPlayers(players: IPlayer[]) {
        players.forEach((player: IPlayer) => {
            const addedPlayer = new Player(
                player.id,
                player.color,
                player.gameId.toString(),
                player.name,
            );
            addedPlayer.setResources(player.playerResources);
            this.#players.set(player.id, addedPlayer);
        });
    }

    getPlayerById(playerId: string) {
        return this.#players.get(playerId);
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
        let winner = null;
        const colorPresence = new Set<PlayerColor>();
        const buildings = this.#entityController.getBuildings();
        for (const building of buildings) {
            if (building.getHealth() > 0) {
                colorPresence.add(building.getColor());
            }
        }
        if (colorPresence.size === 1) {
            winner = [...this.#players.values()].find((player: Player) => {
                player.getColor() === colorPresence.values().next().value;
            });
        }
        if (winner) {
            this.#winner = winner;
            return true;
        }
        return false;
    }

    getWinner() {
        return this.#winner;
    }
}

export default GameLogic;
