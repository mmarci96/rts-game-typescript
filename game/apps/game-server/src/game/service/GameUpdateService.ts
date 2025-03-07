import { Server } from "socket.io";
import Game from "../Game";
import { SaveGameStateParams } from "../../types";
import {
    updateUnitsCache,
    updateBuildingsCache,
    updateResourceFieldsCache,
    getGameState,
    getPlayerCache,
    cachePlayerResources,
} from "../../redis";
import { ConnectionService } from "./connection.service";
import { Player } from "@packages/game-data";

export class GameUpdateService {
    #updateIntervals: Record<string, NodeJS.Timeout> = {};

    isGameUpdating(gameId: string): boolean {
        return !!this.#updateIntervals[gameId];
    }

    startGameUpdates(io: Server, gameId: string, game: Game): void {
        if (this.isGameUpdating(gameId)) return;
        let lastTime = Date.now();
        this.#updateIntervals[gameId] = setInterval(async () => {
            try {
                const now = Date.now();
                const deltaTime = (now - lastTime) / 1000;
                lastTime = now;

                const logic = game.getLogic();
                logic.updateGameState(deltaTime);
                await logic.saveGameState(this.getRedisSavers());

                if (game.isGameOver()) {
                    this.stopGameUpdates(gameId);
                }

                const gameData = await getGameState(gameId);
                io.to(gameId).emit("game_state", gameData);

                ConnectionService.connectedPlayers.forEach(
                    async (value: Player, key: string) => {
                        await cachePlayerResources(gameId, value);
                        const playerData = await getPlayerCache(
                            gameId,
                            value.getId(),
                        );
                        io.to(key).emit("player_state", playerData);
                    },
                );
            } catch (error) {
                console.error("Game update error:", error);
            }
        }, 100);
    }

    stopGameUpdates(gameId: string): void {
        if (this.#updateIntervals[gameId]) {
            console.log("stop game updates");
            clearInterval(this.#updateIntervals[gameId]);
            delete this.#updateIntervals[gameId];
        }
    }

    private getRedisSavers(): SaveGameStateParams {
        return {
            cacheUnits: updateUnitsCache,
            cacheBuildings: updateBuildingsCache,
            cacheResources: updateResourceFieldsCache,
        };
    }
}
