import { Server, Socket } from "socket.io";

interface Game {
    gameData: Record<string, any>; // Flexible game data structure
}
interface ConnectionData {
    playerId: string;
    gameId: string;
}

const games: Record<string, Game> = {};
const connectedPlayers: Record<string, ConnectionData> = {};

export const websocketController = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("New connection: ", socket.id);
        socket.on("load_game", (data) => {
            const { playerId, gameId } = data;
            console.log("playerId", playerId);
            console.log("gameid", gameId);
            games[gameId] = {
                gameData: {},
            };
            connectedPlayers[socket.id] = {
                playerId,
                gameId,
            };
            console.log(connectedPlayers);
            console.log(games);
        });

        socket.on("disconnect", () => {
            console.log("Connection ended: ", socket.id);
            delete connectedPlayers[socket.id];
            console.log(connectedPlayers);
        });
    });
};
