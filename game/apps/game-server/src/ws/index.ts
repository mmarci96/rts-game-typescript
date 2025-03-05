import {
    getEntitiesByGameId,
    saveEntitiesToMongo,
    getGameById,
    getMapById,
    getPlayerById,
    IPlayer,
    IGame,
} from "@packages/game-db";
import { Server, Socket } from "socket.io";
import Game from "../game/Game";
import {
    cacheGameEntities,
    getGameState,
    updateBuildingsCache,
    updateResourceFieldsCache,
    updateUnitsCache,
} from "../redis";
import { GameState } from "@packages/game-data";
import { SaveGameStateParams } from "../types";
import { Types } from "mongoose";

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

const redisCacheSaver = (): SaveGameStateParams => {
    return {
        cacheUnits: updateUnitsCache,
        cacheBuildings: updateBuildingsCache,
        cacheResources: updateResourceFieldsCache,
    };
};

const websocketUpdater = (io: Server, gameId: string) => {
    let lastTime = Date.now();

    const socketUpdateInterval = setInterval(async () => {
        try {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            const logic = games[gameId].game.getLogic();
            logic.updateGameState(deltaTime);
            await logic.saveGameState(redisCacheSaver());
            const gameData = await getGameState(gameId);

            if (games[gameId].game.isGameOver()) {
                clearInterval(socketUpdateInterval);
            }
            io.to(gameId).emit("game_state", gameData);
        } catch (error) {
            console.error("Error in websocketUpdater:", error);
        }
    }, 50);
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
                            try {
                                const [gameData, gameEntities] =
                                    await Promise.all([
                                        getGameById(gameId),
                                        getEntitiesByGameId(gameId),
                                    ]);

                                if (!gameData)
                                    throw new Error("Game not found");
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
                            } catch (error) {
                                console.error(
                                    "Error during game creation:",
                                    error,
                                );
                                delete pendingGameCreations[gameId];
                                throw error;
                            }
                        })();
                    }
                    await pendingGameCreations[gameId];
                }

                const playerData = await getPlayerById(playerId);
                if (!playerData) throw new Error("Player not found");
                socket.join(gameId);

                connectedPlayers[socket.id] = {
                    playerData,
                    gameId,
                };

                games[gameId].game.addPlayer(playerId, playerData.color);
            } catch (error) {
                console.error("Error loading game:", error);
                socket.emit("error", {
                    message: "An error occurred while loading the game.",
                });
            }
        });

        socket.on("pendingCommands", (commands) => {
            try {
                console.log(commands);
                const gameId = connectedPlayers[socket.id].gameId;
                games[gameId].game.getLogic().handlePlayerCommands(commands);
            } catch (error) {
                console.error("Error processing pending commands:", error);
            }
        });

        socket.on("disconnect", async () => {
            try {
                console.log("Connection ended: ", socket.id);
                const connectionData = connectedPlayers[socket.id];

                if (connectionData) {
                    games[connectionData.gameId]?.game.removePlayer(
                        connectionData.playerData.id,
                    );
                    const gameData = await getGameState(connectionData.gameId);
                    await saveEntitiesToMongo(
                        new Types.ObjectId(connectionData.gameId),
                        gameData,
                    );
                    console.log("state saved to mongo");

                    delete connectedPlayers[socket.id];
                }
            } catch (error) {
                console.error("Error during disconnect handling:", error);
            }
        });
    });
};
