import { Player } from "@packages/game-data";
import { ConnectionData } from "../../types";
import { getPlayerById } from "@packages/game-db";
import { Types } from "mongoose";
import { cachePlayer } from "../../redis";

export class ConnectionService {
    static connections: Record<string, ConnectionData> = {};

    static async handlePlayerJoin(socketId: string, playerId: string, gameId: string) {
        const playerData = await getPlayerById(new Types.ObjectId(playerId));
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
    static handleDisconnect(socketId: string) {
        delete ConnectionService.connections[socketId]
    }
    static getConnectionData(socketId: string) {
        return ConnectionService.connections[socketId];
    }
}
