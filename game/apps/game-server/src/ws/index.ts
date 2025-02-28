import {
    getEntitiesByGameId,
    getGameById,
    getMapById,
    getPlayerById,
    IPlayer,
    IGame,
} from "@packages/game-db";
import { Server, Socket } from "socket.io";
import Game from "../game/Game";
import { cacheGameEntities, getGameState } from "../redis";
import { GameState } from "../types";

interface GameData {
    gameData: IGame;
    gameState: GameState;
    game: Game;
}

interface ConnectionData {
    playerData: IPlayer;
    gameId: string;
}

const games: Record<string, GameData> = {};
const connectedPlayers: Record<string, ConnectionData> = {};
const pendingGameCreations: Record<string, Promise<void>> = {};

const websocketUpdater = (io: Server, gameId: string) => {
    let count = 0;
    const saveRate = 5;
    const socketUpdateInterval = setInterval(async () => {
        const gameData = await getGameState(gameId);
        io.to(gameId).emit("game_state", gameData);
        count++;
        if (count >= saveRate) {
            //count = 0;

            clearInterval(socketUpdateInterval);
        }
    }, 100);
};

export const websocketController = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("New connection: ", socket.id);

        socket.on("load_game", async (data) => {
            try {
                const { playerId, gameId } = data;
                if (!games[gameId]) {
                    if (!pendingGameCreations[gameId]) {
                        pendingGameCreations[gameId] = (async () => {
                            const [gameData, gameEntities] = await Promise.all([
                                getGameById(gameId),
                                getEntitiesByGameId(gameId),
                            ]);

                            if (!gameData) throw new Error("Game not found");
                            const map = await getMapById(gameData.mapId);
                            if (!map) throw new Error("Map not found");
                            await cacheGameEntities(gameEntities);

                            const gameState = await getGameState(gameId);
                            games[gameId] = {
                                gameData,
                                gameState,
                                game: new Game(gameId, map, gameState),
                            };
                            websocketUpdater(io, gameId);
                            delete pendingGameCreations[gameId];
                        })();
                    }
                    await pendingGameCreations[gameId];
                }

                const playerData = await getPlayerById(playerId);
                socket.join(gameId);

                if (!playerData) throw new Error("Player not found");

                connectedPlayers[socket.id] = {
                    playerData,
                    gameId,
                };

                games[gameId].game.addPlayer(playerId, playerData.color);
            } catch (error) {
                console.error("Error loading game:", error);
                socket.emit("error", { message: "error occured" });
            }
        });

        socket.on("disconnect", () => {
            console.log("Connection ended: ", socket.id);
            const connectionData = connectedPlayers[socket.id];

            if (connectionData) {
                games[connectionData.gameId]?.game.removePlayer(
                    connectionData.playerData.id,
                );
                delete connectedPlayers[socket.id];
            }
        });
    });
};
