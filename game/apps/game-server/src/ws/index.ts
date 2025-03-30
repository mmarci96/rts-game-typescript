import { Server, Socket } from "socket.io";
import { ConnectionService } from "./service/connection.service";
import { GameStateService } from "./service/game-state.service";
import { GameUpdateService } from "./service/game-update.service";
import { GameCommandService } from "../game/service/GameCommandService";
import { LoadRequest } from "../types";
import { getGameState } from "../redis";

export const websocketController = (io: Server) => {
    const gameStateService = new GameStateService();
    const gameUpdateService = new GameUpdateService(io);
    const commandService = new GameCommandService();

    io.on("connection", (socket: Socket) => {
        console.log("New connection: ", socket.id);

        socket.on("load_game", async (data: LoadRequest) => {
            const { playerId, gameId } = data;
            await gameStateService.initializeGame(gameId);
            const game = gameStateService.getGame(gameId);
            if (!game) {
                console.error("Game not exist");
                return;
            }
            gameUpdateService.addGame(gameId, game);
            const playerConnecting = game.getLogic().getPlayerById(playerId);
            if (!playerConnecting) {
                console.error("Player not in game?");
                return;
            }
            ConnectionService.handlePlayerJoin(socket.id, playerConnecting);
            console.log("Player connected: ", playerConnecting);
            const gameState = await getGameState(gameId);
            socket.emit("game_state", gameState);
            socket.join(gameId);
        });

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
            await ConnectionService.handleDisconnect(socket.id);
        });
    });
};
