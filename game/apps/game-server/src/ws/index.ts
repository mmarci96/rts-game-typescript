import { Server, Socket } from "socket.io";
import { GameStateService } from "../game/service/GameStateService";
import { GameCommandService } from "../game/service/GameCommandService";
import { GameUpdateService } from "../game/service/GameUpdateService";
import { GameConnectionService } from "../game/service/GameConnectionService";

export const websocketController = (io: Server) => {
    const gameStateService = new GameStateService();
    const connectionService = new GameConnectionService();
    const updateService = new GameUpdateService();
    const commandService = new GameCommandService();

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

                    const { playerData } = connectionService.getConnection(
                        socket.id,
                    )!;
                    game.addPlayer(playerData);
                    socket.join(playerData.id);

                    if (!updateService.isGameUpdating(gameId)) {
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
                console.log(connection);

                if (!connection) return;

                const game = gameStateService.getGame(connection.gameId);
                if (!game) return;

                const { playerId, pendingCommands } = data;
                commandService.handlePlayerCommands(
                    game,
                    pendingCommands,
                    playerId,
                );
            } catch (error) {
                console.error("Command error:", error);
            }
        });

        socket.on("disconnect", async () => {
            try {
                const connection = await connectionService.handlePlayerLeave(
                    socket.id,
                );
                if (!connection) return;

                const game = gameStateService.getGame(connection.gameId);
                game?.removePlayer(connection.playerId);

                if (!game?.isGameOver()) {
                    gameStateService.removeGame(connection.gameId);
                    updateService.stopGameUpdates(connection.gameId);
                }
            } catch (error) {
                console.error("Disconnect error:", error);
            }
        });
    });
};
