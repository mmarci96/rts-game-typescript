import { io, Socket } from "socket.io-client";
import GameLoader from "./game/GameLoader";
import Game from "./game/Game";
import { GameState } from "@packages/game-data";
import Overlay from "./game/ui/Overlay";

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

let lastTime = Date.now();
const socketHandler = (
    socket: Socket,
    playerId: string,
    gameId: string,
    game: Game,
) => {
    try {
        socket.on("connect", () => {
            console.log("connected");
            const data = { playerId, gameId };
            socket.emit("load_game", data);
        });
        socket.on("game_state", (data: GameState) => {
            const now = Date.now();
            const deltaTimeMs = now - lastTime;
            lastTime = now;
            Overlay.statusBar.setPing(deltaTimeMs);
            game.getLogic().updateGameState(data);
            if (!game.getLogic().running) {
                game.getLogic().startGameLoop(createCommand);
            }
        });

        socket.on("player_state", (playerState) => {
            game.getLogic().updatePlayerState(playerState.playerResources);
        });

        setInterval(() => {
            if (pendingCommands.length >= 1) {
                const commands = {
                    playerId,
                    pendingCommands,
                };
                socket.emit("pendingCommands", commands);
                console.log("Commands added to stack:", pendingCommands);
                pendingCommands = [];
            }
        }, 60);
    } catch (err) {
        console.error(err);
    }
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
