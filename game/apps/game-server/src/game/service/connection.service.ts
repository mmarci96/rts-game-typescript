import {
    saveEntitiesToMongo,
    getPlayerById,
    updatePlayerResources,
} from "@packages/game-db";
import { Types } from "mongoose";
import {
    cachePlayer,
    deletePlayerCache,
    getGameState,
    getPlayerCache,
} from "../../redis";
import { Player } from "@packages/game-data";

export class ConnectionService {
    static connectedPlayers: Map<string, Player> = new Map<string, Player>();

    async handlePlayerJoin(
        socketId: string,
        playerId: string,
        gameId: string,
    ): Promise<void> {
        const playerData = await getPlayerById(new Types.ObjectId(playerId));
        if (!playerData) throw new Error("Player not found");
        await cachePlayer(playerData);
        const player = new Player(playerId, playerData.color, gameId);
        player.setResources(playerData.playerResources);
        ConnectionService.connectedPlayers.set(socketId, player);
        console.log(ConnectionService.connectedPlayers.values());
    }

    async handlePlayerLeave(
        socketId: string,
    ): Promise<{ gameId: string; playerId: string } | null> {
        const connection = ConnectionService.connectedPlayers.get(socketId);
        if (!connection) return null;

        const gameId = connection.getGameId();
        const playerId = connection.getId();
        await saveEntitiesToMongo(gameId, await getGameState(gameId));
        const playerCacheData = await getPlayerCache(gameId, playerId);
        console.log(playerCacheData);

        //await updatePlayerResources(playerId, playerCacheData);

        //await deletePlayerCache(playerId, gameId);
        ConnectionService.connectedPlayers.delete(socketId);
        return { gameId, playerId: playerId };
    }

    getConnection(socketId: string) {
        return ConnectionService.connectedPlayers.get(socketId);
    }
}
