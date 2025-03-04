import { io, Socket } from "socket.io-client";
import GameLoader from "./game/GameLoader";
import Game from "./game/Game";
import { GameState } from "@packages/game-data";

let pendingCommands: Command[] = [];

export interface Command {
    action: string;
    entityId: string;
    targetX?: number;
    targetY?: number;
    targetId?: string;
}

const createCommand = (commands: Command[]) => {
    commands.forEach((command: Command) => {
        pendingCommands.push(command);
    });
};

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
        setTimeout(() => {
            game.getLogic().gameLoop(createCommand);
        }, 1000);
    });
    socket.on("game_state", (data: GameState) => {
        //console.log(data);
        game.getLogic().updateGameState(data);
    });

    const commandInterval = setInterval(() => {
        if (pendingCommands.length >= 1) {
            socket.emit("pendingCommands", pendingCommands);
            console.log(pendingCommands);

            pendingCommands = [];
            console.log("Commands added to stack");
        }
    }, 60);
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

    const game = await GameLoader.loadGame(gameId, playerId);
    const socket = io();
    socketHandler(socket, playerId, gameId, game);
};

window.addEventListener("load", loadEvent);
