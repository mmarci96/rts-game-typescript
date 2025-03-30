import Game from "../../game/Game";
import {
    getGameState,
    cacheGameEntities,
    updateUnitsCache,
    updateBuildingsCache,
    updateResourceFieldsCache,
} from "../../redis";
import {
    getEntitiesByGameId,
    getGameById,
    getMapById,
    getPlayersByGameId,
} from "@packages/game-db/dist";

export class GameStateService {
    private games = new Map<string, Game>();
    private pendingGameCreations = new Map<string, Promise<void>>();

    async initializeGame(gameId: string): Promise<Game> {
        if (!this.pendingGameCreations.has(gameId)) {
            this.pendingGameCreations.set(
                gameId,
                this._createGameInstance(gameId),
            );
        }

        try {
            await this.pendingGameCreations.get(gameId);
        } finally {
            if (this.games.has(gameId)) {
                this.pendingGameCreations.delete(gameId);
            }
        }

        const game = this.games.get(gameId);
        if (!game) {
            throw new Error(`Game ${gameId} failed to initialize`);
        }
        return game;
    }

    private async _createGameInstance(gameId: string): Promise<void> {
        try {
            const [gameData, gameEntities] = await Promise.all([
                getGameById(gameId),
                getEntitiesByGameId(gameId),
            ]);

            if (!gameData) throw new Error("Game not found");
            const map = await getMapById(gameData.mapId.toString());
            if (!map) throw new Error("Map not found");

            await cacheGameEntities(gameEntities);
            const gameState = await getGameState(gameId);
            const players = await getPlayersByGameId(gameId);

            const game = new Game(gameId, map, gameState, players);
            this.games.set(gameId, game);
        } catch (error) {
            this.games.delete(gameId);
            throw error;
        }
    }

    getGame(gameId: string): Game | undefined {
        return this.games.get(gameId);
    }

    removeGame(gameId: string): void {
        this.games.delete(gameId);
        this.pendingGameCreations.delete(gameId);
    }

    async saveGameState(gameId: string): Promise<void> {
        const game = this.games.get(gameId);
        if (!game) return;

        const logic = game.getLogic();
        await logic.saveGameState({
            cacheUnits: updateUnitsCache,
            cacheBuildings: updateBuildingsCache,
            cacheResources: updateResourceFieldsCache,
        });
    }
}
