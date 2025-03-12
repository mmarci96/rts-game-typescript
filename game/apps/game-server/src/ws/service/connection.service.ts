import { Player } from "@packages/game-data";
import { ConnectionData } from "../../types";
import { getPlayerById, saveEntitiesToMongo, updatePlayerResources } from "@packages/game-db";
import { cachePlayer, deletePlayerCache, getGameState, getPlayerCache } from "../../redis";

export class ConnectionService {
    static connections: Record<string, ConnectionData> = {};

    static async handlePlayerJoin(socketId: string, playerId: string, gameId: string) {
        const playerData = await getPlayerById(playerId);
        if (!playerData) {
            return;
        }
        await cachePlayer(playerData);
        const player = new Player(playerId, playerData.color, gameId);
        player.setResources(playerData.playerResources);
        ConnectionService.connections[socketId] = {
            playerId, gameId, player
        }
    }
    static async handleDisconnect(socketId: string) {
        const { gameId, playerId } = ConnectionService.connections[socketId];

        await saveEntitiesToMongo(gameId, await getGameState(gameId));
        const playerCache = await getPlayerCache(gameId, playerId);
        await updatePlayerResources(playerId, playerCache?.playerResources);
        await deletePlayerCache(playerId, gameId);
        delete ConnectionService.connections[socketId]
    }
    static getConnectionData(socketId: string) {
        return ConnectionService.connections[socketId];
    }
}
