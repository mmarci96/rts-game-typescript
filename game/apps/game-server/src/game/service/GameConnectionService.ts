import { IPlayer, saveEntitiesToMongo, getPlayerById } from "@packages/game-db";
import { Types } from "mongoose";
import { getGameState } from "../../redis";

export class GameConnectionService {
    private connectedPlayers: Record<
        string,
        { playerData: IPlayer; gameId: string }
    > = {};

    async handlePlayerJoin(
        socketId: string,
        playerId: string,
        gameId: string,
    ): Promise<void> {
        const playerData = await getPlayerById(new Types.ObjectId(playerId));

        if (!playerData) throw new Error("Player not found");

        this.connectedPlayers[socketId] = {
            playerData,
            gameId,
        };
    }

    async handlePlayerLeave(
        socketId: string,
    ): Promise<{ gameId: string; playerId: string } | null> {
        const connection = this.connectedPlayers[socketId];
        if (!connection) return null;

        const { gameId, playerData } = connection;
        await saveEntitiesToMongo(
            new Types.ObjectId(gameId),
            await getGameState(gameId),
        );

        delete this.connectedPlayers[socketId];
        return { gameId, playerId: playerData.id };
    }

    getConnection(socketId: string) {
        return this.connectedPlayers[socketId];
    }
}
