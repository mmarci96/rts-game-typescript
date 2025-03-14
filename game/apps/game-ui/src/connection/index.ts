import { io, Socket } from "socket.io-client";
import GameLoader from "../game/GameLoader";
import Game from "../game/Game";
import { GameState, PlayerColor } from "@packages/game-data";
import Overlay from "../game/ui/Overlay";
import { Command } from "../types";

export class ConnectionHandler {
    private socket: Socket;
    private playerId: string;
    private gameId: string;
    private game: Game;
    private pendingCommands: Command[] = [];
    private lastPingTime = Date.now();
    private commandInterval: number = 0;

    constructor(socket: Socket, playerId: string, gameId: string, game: Game) {
        this.socket = socket;
        this.playerId = playerId;
        this.gameId = gameId;
        this.game = game;

        this.initializeSocketHandlers();
        this.setupCommandBatching();
    }

    public static async initialize() {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        const { gameId, playerId } = this.getIdFromUrl(window.location.pathname);
        const game = await GameLoader.loadGame(gameId, playerId);
        const socket = io();

        return new ConnectionHandler(socket, playerId, gameId, game);
    }

    private static getIdFromUrl(url: string) {
        const arr = url.split("/");
        const lastIndex = arr.length - 1;
        return {
            gameId: arr[lastIndex - 1],
            playerId: arr[lastIndex],
        };
    }

    private initializeSocketHandlers() {
        this.socket.on("connect", () => this.handleConnect());
        this.socket.on("game_state", (data: GameState) => this.handleGameState(data));
        this.socket.on("player_state", (playerState) => this.handlePlayerState(playerState));
        this.socket.on("game_over", (winnerColor: PlayerColor) => this.handleGameOver(winnerColor));
    }

    private handleConnect() {
        console.log("Connected to server");
        const playerColor = this.game.getLogic().getPlayerColor();
        this.socket.emit("load_game", {
            playerId: this.playerId,
            gameId: this.gameId,
            playerColor
        });
    }

    private handleGameState(data: GameState) {
        const now = Date.now();
        const deltaTimeMs = now - this.lastPingTime;
        this.lastPingTime = now;

        Overlay.statusBar.setPing(deltaTimeMs);
        this.game.getLogic().updateGameState(data);

        if (!this.game.getLogic().running) {
            this.game.getLogic().startGameLoop(this.createCommand.bind(this));
        }
    }

    private handlePlayerState(playerState: any) {
        if (playerState) {
            this.game.getLogic().updatePlayerState(playerState.playerResources);
        }
    }

    private handleGameOver(winnerColor: PlayerColor) {
        if (this.game.getLogic().getPlayerColor() === winnerColor) {
            console.log("Winner is you!");
        } else {
            console.log("You lost!");
        }
    }

    private createCommand(commands: Command[]) {
        console.log("Creating commands:", commands);
        this.pendingCommands.push(...commands);
    }

    private setupCommandBatching() {
        // Use window.setInterval for browser environment
        this.commandInterval = window.setInterval(() => {
            if (this.pendingCommands.length > 0) {
                const commands = {
                    playerId: this.playerId,
                    pendingCommands: this.pendingCommands
                };
                this.socket.emit("pendingCommands", commands);
                console.log("Sent commands:", this.pendingCommands);
                this.pendingCommands = [];
            }
        }, 60);
    }

    public dispose() {
        clearInterval(this.commandInterval);
        this.socket.off("connect");
        this.socket.off("game_state");
        this.socket.off("player_state");
        this.socket.off("game_over");
        this.socket.disconnect();
    }
}


