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
    unitType?: string;
}

const createCommand = (commands: Command[]) => {
    console.log(commands);
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
    });
    socket.on("game_state", (data: GameState) => {
        game.getLogic().updateGameState(data);
        if (!game.getLogic().running) {
            game.getLogic().startGameLoop(createCommand);
        }
    });

    const commandInterval = setInterval(() => {
        if (pendingCommands.length >= 1) {
            socket.emit("pendingCommands", pendingCommands);
            console.log("Commands added to stack:", pendingCommands);
            pendingCommands = [];
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
