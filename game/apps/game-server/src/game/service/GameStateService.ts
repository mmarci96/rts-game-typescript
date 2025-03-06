import Game from "../Game";
import { getGameState, cacheGameEntities } from "../../redis";
import {
    getEntitiesByGameId,
    getGameById,
    getMapById,
} from "@packages/game-db";
import { Types } from "mongoose";

export class GameStateService {
    private games: Record<string, Game> = {};
    private pendingGameCreations: Record<string, Promise<void>> = {};

    async initializeGame(gameId: string): Promise<Game> {
        if (!this.pendingGameCreations[gameId]) {
            this.pendingGameCreations[gameId] =
                this._createGameInstance(gameId);
        }
        await this.pendingGameCreations[gameId];
        return this.games[gameId];
    }

    private async _createGameInstance(gameId: string): Promise<void> {
        try {
            const [gameData, gameEntities] = await Promise.all([
                getGameById(new Types.ObjectId(gameId)),
                getEntitiesByGameId(new Types.ObjectId(gameId)),
            ]);

            if (!gameData) throw new Error("Game not found");
            const map = await getMapById(gameData.mapId);
            if (!map) throw new Error("Map not found");

            await cacheGameEntities(gameEntities);
            const gameState = await getGameState(gameId);

            this.games[gameId] = new Game(gameId, map, gameState);
            delete this.pendingGameCreations[gameId];
        } catch (error) {
            delete this.pendingGameCreations[gameId];
            throw error;
        }
    }

    getGame(gameId: string): Game | undefined {
        return this.games[gameId];
    }

    removeGame(gameId: string): void {
        delete this.games[gameId];
    }
}
