import Game from "../../game/Game";
import { Server } from "socket.io";
import {
    getGameState,
    updateUnitsCache,
    updateBuildingsCache,
    updateResourceFieldsCache,
    cachePlayerResources,
    getPlayerCache,
} from "../../redis";
import { SaveGameStateParams } from "../../types";
import { ConnectionService } from "./connection.service";
import { deleteBuildingById, deleteResourceById, deleteUnitById } from "@packages/game-db";

export class GameUpdateService {
    private activeGames: Map<string, Game> = new Map();
    private updateInterval: NodeJS.Timeout | null = null;

    constructor(io: Server) {
        this.startGameUpdates(io);
    }

    private startGameUpdates(io: Server): void {
        if (this.updateInterval) {
            return;
        }

        this.updateInterval = setInterval(() => {
            const now = Date.now();
            this.activeGames.forEach((game, gameId) => {
                this.updateGame(io, gameId, game, now);
            });
        }, 100);
    }

    private async updateGame(io: Server, gameId: string, game: Game, now: number): Promise<void> {
        const deltaTime = (now - game.lastUpdateTime) / 1000;
        game.lastUpdateTime = now;

        const logic = game.getLogic();
        logic.updateGameState(deltaTime);
        await logic.saveGameState(this.getRedisSavers());
        if (game.isGameOver()) {
            this.stopGameUpdates();
            io.to(gameId).emit("game_over", { winner: logic.winnerColor });
        }
        const gameData = await getGameState(gameId);
        io.to(gameId).emit("game_state", gameData);
        Object.entries(ConnectionService.connections).forEach(async ([socketId, connectionData]) => {
            const minedRes = logic.loadMinedResources(connectionData.player);
            if (minedRes.food || minedRes.wood) {
                const { food, wood } = connectionData.player.getResources()
                connectionData.player.setFood(food + minedRes.food)
                connectionData.player.setWood(wood + minedRes.wood)
            }
            await cachePlayerResources(connectionData.gameId, connectionData.player)
            const data = await getPlayerCache(gameId, connectionData.playerId);
            io.to(socketId).emit("player_state", data);
        })
    }

    private stopGameUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    private getRedisSavers(): SaveGameStateParams {
        return {
            cacheUnits: updateUnitsCache,
            cacheBuildings: updateBuildingsCache,
            cacheResources: updateResourceFieldsCache,
        };
    }

    addGame(gameId: string, game: Game): void {
        this.activeGames.set(gameId, game);
    }

    removeGame(gameId: string): void {
        this.activeGames.delete(gameId);
    }

}

