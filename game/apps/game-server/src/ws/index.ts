import { Server, Socket } from "socket.io";
//import { GameStateService } from "../game/services/GameStateService";
//import { GameConnectionService } from "../game/services/GameConnectionService";
//import { GameUpdateService } from "../services/game-update.service";
//import { GameCommandService } from "../services/game-command.service";
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

                    // Initialize game state if needed
                    await gameStateService.initializeGame(gameId);
                    const game = gameStateService.getGame(gameId);

                    if (!game) throw new Error("Game initialization failed");

                    // Handle player connection
                    await connectionService.handlePlayerJoin(
                        socket.id,
                        playerId,
                        gameId,
                    );
                    socket.join(gameId);

                    // Add player to game logic
                    const { playerData } = connectionService.getConnection(
                        socket.id,
                    )!;
                    game.addPlayer(playerData.id, playerData.color);

                    // Start game updates if not already running
                    if (!updateService.isGameUpdating(gameId)) {
                        updateService.startGameUpdates(io, gameId, game);
                    }
                } catch (error) {
                    console.error("Error loading game:", error);
                    socket.emit("error", { message: "Failed to load game" });
                }
            },
        );

        socket.on("pendingCommands", (commands) => {
            try {
                const connection = connectionService.getConnection(socket.id);
                if (!connection) return;

                const game = gameStateService.getGame(connection.gameId);
                if (!game) return;

                commandService.handlePlayerCommands(game, commands);
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

                if (game?.isGameOver()) {
                    gameStateService.removeGame(connection.gameId);
                    updateService.stopGameUpdates(connection.gameId);
                }
            } catch (error) {
                console.error("Disconnect error:", error);
            }
        });
    });
};
