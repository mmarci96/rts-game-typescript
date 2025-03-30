import Game from "../../game/Game";
import { Server } from "socket.io";
import {
    updateUnitsCache,
    updateBuildingsCache,
    updateResourceFieldsCache,
    cachePlayerResources,
    getPlayerCache,
    flushGameCache,
} from "../../redis";
import { SaveGameStateParams } from "../../types";
import { ConnectionService } from "./connection.service";
import { setWinnerOnGameOver } from "@packages/game-db";
import { Player } from "@packages/game-data";
import GameLogic from "../../game/logic/GameLogic";

export class GameUpdateService {
    private activeGames: Map<string, Game> = new Map();
    private updateInterval: NodeJS.Timeout | null = null;
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.startGameUpdates();
    }

    private startGameUpdates(): void {
        if (this.updateInterval) {
            return;
        }
        console.log("Updating start");
        this.updateInterval = setInterval(() => {
            const now = Date.now();
            this.activeGames.forEach((game, gameId) => {
                this.updateGame(gameId, game, now);
            });
        }, 50);
    }

    private async updateGame(
        gameId: string,
        game: Game,
        now: number,
    ): Promise<void> {
        const deltaTime = (now - game.lastUpdateTime) / 1000;
        game.lastUpdateTime = now;

        const logic = game.getLogic();
        logic.updateGameState(deltaTime);
        const updateData = logic.getUpdatedEntities();
        this.io.to(gameId).emit("game_update", updateData);
        const createdUnits = logic.getCreatedUnits();
        if (createdUnits.length > 0) {
            createdUnits.forEach((unitData) => {
                this.io.to(gameId).emit("unit_created", unitData);
                logic.loadCreatedUnit(unitData);
            });
            logic.emptyCreatedUnits();
        }

        await this.handlePlayerUpdates(logic);
        if (game.isGameOver() && logic.getWinner()) {
            await this.handleGameOver(logic.getWinner()!);
        }
        await logic.saveGameState(this.getRedisSavers());
    }

    private async handlePlayerUpdates(logic: GameLogic) {
        if (!Object.entries(ConnectionService.connections).length) {
            this.stopGameUpdates();
            return;
        }
        Object.entries(ConnectionService.connections).forEach(
            async ([socketId, connectionData]) => {
                const minedRes = logic.loadMinedResources(
                    connectionData.player,
                );
                if (minedRes.food || minedRes.wood) {
                    const { food, wood } = connectionData.player.getResources();
                    connectionData.player.setFood(food + minedRes.food);
                    connectionData.player.setWood(wood + minedRes.wood);
                }
                await cachePlayerResources(
                    connectionData.gameId,
                    connectionData.player,
                );
                const data = await getPlayerCache(
                    connectionData.gameId,
                    connectionData.playerId,
                );
                this.io.to(socketId).emit("player_state", data);
            },
        );
    }

    private async handleGameOver(winner: Player) {
        const gameId = winner.getGameId();
        console.log(`Game:${gameId} ended,winner:${winner.getName()}`);
        const winningPlayerData = {
            name: winner.getName(),
            id: winner.getId(),
            color: winner.getColor(),
        };
        this.io.to(gameId).emit("game_over", winningPlayerData);
        await setWinnerOnGameOver(gameId, winner.getId());
        await flushGameCache(gameId);
        this.removeGame(gameId);
    }

    private stopGameUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log("Updating stopped");
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
        if (!this.updateInterval) {
            this.startGameUpdates();
        }
    }

    removeGame(gameId: string): void {
        this.activeGames.delete(gameId);
        if (this.activeGames.size === 0) {
            this.stopGameUpdates();
        }
    }
}
