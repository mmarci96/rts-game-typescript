import { Server, Socket } from "socket.io";
import { ConnectionService } from "./service/connection.service";
import { GameStateService } from "./service/game-state.service";
import { GameUpdateService } from "./service/game-update.service";
import { GameCommandService } from "../game/service/GameCommandService";

export const websocketController = (io: Server) => {
    const gameStateService = new GameStateService();
    const gameUpdateService = new GameUpdateService(io);
    const commandService = new GameCommandService();

    io.on("connection", (socket: Socket) => {
        console.log("New connection: ", socket.id);

        socket.on(
            "load_game",
            async (data: { playerId: string; gameId: string }) => {
                const { playerId, gameId } = data;
                ConnectionService.handlePlayerJoin(socket.id, playerId, gameId);
                console.log(ConnectionService.getConnectionData(socket.id));
                await gameStateService.initializeGame(gameId);
                const game = gameStateService.getGame(gameId);
                if (game) {
                    gameUpdateService.addGame(gameId, game);
                }
                socket.join(gameId);
            },
        );

        socket.on("pendingCommands", (data) => {
            const connection = ConnectionService.getConnectionData(socket.id);
            if (!connection) return;

            const game = gameStateService.getGame(connection.gameId);
            if (!game) return;

            const { playerId, pendingCommands } = data;
            if (playerId !== connection.playerId) return;

            commandService.handlePlayerCommands(
                game,
                pendingCommands,
                connection.player,
            );
        });

        socket.on("disconnect", async () => {
            ConnectionService.handleDisconnect(socket.id);
        });
    });
};
