import {
    GameEntityData,
    getEntitiesByGameId,
    getGameById,
    getMapById,
    getPlayerById,
    IPlayer,
    IGame,
} from "@packages/game-db";
import { Server, Socket } from "socket.io";
import Game from "../game/Game";

interface GameData {
    gameData: IGame;
    gameEntities: GameEntityData;
    game: Game;
}

interface ConnectionData {
    playerData: IPlayer;
    gameId: string;
}

const games: Record<string, GameData> = {};
const connectedPlayers: Record<string, ConnectionData> = {};
const pendingGameCreations: Record<string, Promise<void>> = {};

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

                            games[gameId] = {
                                gameData,
                                gameEntities,
                                game: new Game(gameId, map, gameEntities),
                            };
                            delete pendingGameCreations[gameId];
                        })();
                    }
                    await pendingGameCreations[gameId];
                }

                const playerData = await getPlayerById(playerId);
                if (!playerData) throw new Error("Player not found");

                connectedPlayers[socket.id] = {
                    playerData,
                    gameId,
                };

                games[gameId].game.addPlayer(playerId, playerData.color);

                console.log(`Player ${playerId} added to game ${gameId}`);
                console.log(
                    "Connected players",
                    games[gameId].game.getPlayers(),
                );
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
