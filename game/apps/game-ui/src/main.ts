import { io, Socket } from "socket.io-client";
import GameLoader from "./game/GameLoader";
import Game from "./game/Game";
import { GameState } from "@packages/game-data";

const socketHandler = (
    socket: Socket,
    playerId: string,
    gameId: string,
    game: Game,
) => {
    socket.on("connect", () => {
        console.log("connected");
        const data = { playerId, gameId };
        socket.emit("load_game", data);
    });
    socket.on("game_state", (data: GameState) => {
        //console.log(data);
        game.getLogic().updateGameState(data);
    });
};

const getIdFromUrl = (url: string) => {
    const arr = url.split("/");
    const lastIndex = arr.length - 1;

    return {
        gameId: arr[lastIndex - 1],
        playerId: arr[lastIndex],
    };
};
const loadEvent = async () => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    const url = window.location.pathname;
    const { gameId, playerId } = getIdFromUrl(url);

    console.log("gameId", gameId);
    console.log("userid", playerId);
    const game = await GameLoader.loadGame(gameId);
    const socket = io();
    socketHandler(socket, playerId, gameId, game);
};

window.addEventListener("load", loadEvent);
