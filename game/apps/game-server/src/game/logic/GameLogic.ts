import {
    GameEntity,
    GameMap,
    GameState,
    Player,
    PlayerColor,
    UnitData,
} from "@packages/game-data/dist";
import { IMap, IPlayer } from "@packages/game-db/dist";
import EntityController from "./EntityController";
import { SaveGameStateParams } from "../../types";
import BuildingController from "./BuildingController";
import ResourceController from "./ResourceController";
import UnitController from "./UnitController";

class GameLogic {
    private entityController: EntityController;
    private gameId: string;
    private gameMap;
    private players: Map<string, Player>;
    private winner: Player | null = null;

    constructor(
        id: string,
        gameData: GameState,
        gameMap: IMap,
        players: IPlayer[],
    ) {
        this.players = new Map<string, Player>();
        this.gameMap = new GameMap(gameMap.tiles);
        this.gameId = id;
        const unitController = new UnitController(this.gameMap);
        const resourceController = new ResourceController();
        const buildingController = new BuildingController();
        this.entityController = new EntityController(
            unitController,
            buildingController,
            resourceController,
        );

        this.loadData(gameData);
        this.loadPlayers(players);
    }

    getUpdatedEntities() {
        return this.entityController.getEntityUpdateData();
    }

    loadData(data: GameState) {
        this.entityController.loadEntities(data);
    }

    loadCreatedUnit(data: UnitData) {
        this.entityController.loadCreatedUnit(data);
    }

    addCreatedUnit(data: UnitData) {
        this.entityController.addCreatedUnit(data);
    }

    emptyCreatedUnits() {
        this.entityController.emptyCreatedUnits();
    }

    getCreatedUnits(): UnitData[] {
        return this.entityController.getCreatedUnits();
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
            this.players.set(player.id, addedPlayer);
        });
    }

    getPlayerById(playerId: string) {
        return this.players.get(playerId);
    }

    updateGameState(deltaTime: number) {
        this.entityController.refreshEntities(deltaTime);
    }

    loadMinedResources(player: Player) {
        return this.entityController.loadMinedResources(player);
    }

    async saveGameState(redisCache: SaveGameStateParams) {
        await redisCache.cacheUnits(
            this.gameId,
            this.entityController.getUnits(),
        );
        await redisCache.cacheBuildings(
            this.gameId,
            this.entityController.getBuildings(),
        );
        await redisCache.cacheResources(
            this.gameId,
            this.entityController.getResources(),
        );
    }

    isGameOver() {
        let winner = null;
        const colorPresence = new Set<PlayerColor>();
        const buildings = this.entityController.getBuildings();
        for (const building of buildings) {
            colorPresence.add(building.getColor());
        }
        if (colorPresence.size === 1) {
            winner = [...this.players.values()].find(
                (player: Player) =>
                    player.getColor() === colorPresence.values().next().value,
            );
        }
        if (winner) {
            this.winner = winner;
            return true;
        }
        return false;
    }

    getWinner() {
        return this.winner;
    }

    getEntityById(id: string): GameEntity | null {
        return this.entityController.getEntityById(id);
    }

    getUnitById(id: string) {
        return this.entityController.getUnitById(id);
    }

    getBuildingById(id: string) {
        return this.entityController.getBuildingById(id);
    }

    getResourceById(id: string) {
        return this.entityController.getResourceById(id);
    }
}

export default GameLogic;
