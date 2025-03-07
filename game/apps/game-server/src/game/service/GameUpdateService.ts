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
    #updateIntervals = new Map<string, NodeJS.Timeout>();

    isGameUpdating(gameId: string): boolean {
        return this.#updateIntervals.has(gameId);
    }

    async startGameUpdates(
        io: Server,
        gameId: string,
        game: Game,
    ): Promise<void> {
        if (this.isGameUpdating(gameId)) return;
        let lastTime = Date.now();
        const interval = setInterval(async () => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            const logic = game.getLogic();
            logic.updateGameState(deltaTime);
            await logic.saveGameState(this.getRedisSavers());

            if (game.isGameOver()) {
                this.stopGameUpdates(gameId);
                io.to(gameId).emit("game_over", { winner: logic.winnerColor })
            }

            const gameData = await getGameState(gameId);
            io.to(gameId).emit("game_state", gameData);

            ConnectionService.connectedPlayers.forEach(
                async (value: Player, key: string) => {
                    const minedRes = logic.loadMinedResources(value);
                    console.log(minedRes);

                    if (minedRes.food || minedRes.wood) {
                        const { food, wood } = value.getResources()
                        value.setFood(food + minedRes.food)
                        value.setWood(wood + minedRes.wood)
                        console.log(value.getResources());

                    }
                    await cachePlayerResources(gameId, value);
                    const playerData = await getPlayerCache(
                        gameId,
                        value.getId(),
                    );

                    io.to(key).emit("player_state", playerData);
                },
            );
        }, 100);
        this.#updateIntervals.set(gameId, interval);
    }

    stopGameUpdates(gameId: string): void {
        const interval = this.#updateIntervals.get(gameId);
        if (interval) {
            clearInterval(interval);
            this.#updateIntervals.delete(gameId);
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
