import { Player } from "@packages/game-data/dist";
import { ConnectionData } from "../../types";
import {
    saveEntitiesToMongo,
    updatePlayerResources,
} from "@packages/game-db/dist";
import {
    cachePlayer,
    deletePlayerCache,
    getGameState,
    getPlayerCache,
} from "../../redis";

export class ConnectionService {
    static connections: Record<string, ConnectionData> = {};

    static async handlePlayerJoin(socketId: string, player: Player) {
        await cachePlayer(player);
        const gameId = player.getGameId();
        const playerId = player.getId();
        ConnectionService.connections[socketId] = {
            gameId,
            playerId,
            player,
        };
    }
    static async handleDisconnect(socketId: string) {
        const { gameId, playerId } = ConnectionService.connections[socketId];

        await saveEntitiesToMongo(gameId, await getGameState(gameId));
        const playerCache = await getPlayerCache(gameId, playerId);
        await updatePlayerResources(playerId, playerCache?.playerResources);
        await deletePlayerCache(playerId, gameId);
        delete ConnectionService.connections[socketId];
    }
    static getConnectionData(socketId: string) {
        return ConnectionService.connections[socketId];
    }
}
