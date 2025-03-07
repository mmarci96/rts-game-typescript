import { Server, Socket } from "socket.io";
import { GameStateService } from "../game/service/GameStateService";
import { GameCommandService } from "../game/service/GameCommandService";
import { GameUpdateService } from "../game/service/GameUpdateService";
import { ConnectionService } from "../game/service/connection.service";

export const websocketController = (io: Server) => {
    const gameStateService = new GameStateService();
    const connectionService = new ConnectionService();
    const updateService = new GameUpdateService();
    const commandService = new GameCommandService();
    console.log(
        gameStateService,
        connectionService,
        updateService,
        commandService,
    );
    io.on("connection", (socket: Socket) => {
        console.log("New connection: ", socket.id);

        socket.on(
            "load_game",
            async (data: { playerId: string; gameId: string }) => {
                try {
                    const { playerId, gameId } = data;
                    await gameStateService.initializeGame(gameId);
                    const game = gameStateService.getGame(gameId);
                    if (!game) throw new Error("Game initialization failed");
                    await connectionService.handlePlayerJoin(
                        socket.id,
                        playerId,
                        gameId,
                    );
                    socket.join(gameId);
                    if (!updateService.isGameUpdating(gameId)) {
                        console.log("Loop should start.");
                        updateService.startGameUpdates(io, gameId, game);
                    }
                } catch (error) {
                    console.error("Error loading game:", error);
                    socket.emit("error", { message: "Failed to load game" });
                }
            },
        );

        socket.on("pendingCommands", (data) => {
            try {
                const connection = connectionService.getConnection(socket.id);
                if (!connection) return;

                const game = gameStateService.getGame(connection.getGameId());
                if (!game) return;

                const { playerId, pendingCommands } = data;
                if (playerId !== connection.getId()) {
                    console.log("playerId not valid.");
                }

                commandService.handlePlayerCommands(
                    game,
                    pendingCommands,
                    connection,
                );
            } catch (error) {
                console.error("Command error:", error);
            }
        });

        socket.on("disconnect", async () => {
            console.log("disconnect", socket.id);

            const connection = await connectionService.handlePlayerLeave(
                socket.id,
            );
            if (!connection) {
                console.error(connection);
                throw new Error("Error during disconnect");
            }
            updateService.stopGameUpdates(connection.gameId);
            //const game = gameStateService.getGame(connection.gameId);
            //if (!game) throw new Error("Disconnect game");
            //
            //if (game.isGameOver()) {
            //    gameStateService.removeGame(connection.gameId);
            //    updateService.stopGameUpdates(connection.gameId);
            //}
        });
    });
};
