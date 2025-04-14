import { io, Socket } from "socket.io-client";
import GameLoader from "../game/GameLoader";
import Game from "../game/Game";
import {
    GameState,
    GameUpdateData,
    PlayerColor,
    UnitData,
} from "@packages/game-data/dist";
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
        const { gameId, playerId, socketEndpoint } = await this.getIdFromUrl(
            window.location.pathname,
        );
        console.log("socketEndpoint", socketEndpoint);

        const game = await GameLoader.loadGame(gameId, playerId);
        const socket = io("/", {
            path: `/${socketEndpoint}/socket.io`,
        });

        return new ConnectionHandler(socket, playerId, gameId, game);
    }

    private static async getIdFromUrl(url: string) {
        const arr = url.split("/");
        const lastIndex = arr.length - 1;
        const gameId = arr[lastIndex - 1];
        const playerId = arr[lastIndex];
        const res = await fetch(`/game_location/${gameId}/${playerId}`);
        const data: { server_endpoint: string } = await res.json();

        return {
            gameId,
            playerId,
            socketEndpoint: data.server_endpoint,
        };
    }

    private initializeSocketHandlers() {
        this.socket.on("connect", () => this.handleConnect());
        this.socket.on("game_state", (data) => this.handleGameState(data));
        this.socket.on("player_state", (data) => this.handlePlayerState(data));
        this.socket.on("game_over", (data) => this.handleGameOver(data));
        this.socket.on("game_update", (data) => this.handleUpdate(data));
        this.socket.on("unit_created", (data) => this.handleUnitCreated(data));
    }

    private updateRefreshRate() {
        const now = Date.now();
        const deltaTimeMs = now - this.lastPingTime;
        this.lastPingTime = now;
        Overlay.statusBar.setPing(deltaTimeMs);
    }

    private handleUnitCreated(data: UnitData) {
        this.game.getLogic().handleUnitCreated(data);
    }

    private handleUpdate(data: GameUpdateData) {
        this.updateRefreshRate();
        this.game.getLogic().updateEntities(data);
    }

    private handleConnect() {
        console.log("Connected to server");
        const playerColor = this.game.getLogic().getPlayerColor();
        this.socket.emit("load_game", {
            playerId: this.playerId,
            gameId: this.gameId,
            playerColor,
        });
    }

    private handleGameState(data: GameState) {
        this.updateRefreshRate();
        this.game.getLogic().loadGameState(data);
        if (!this.game.getLogic().running) {
            this.game.getLogic().startGameLoop(this.createCommand.bind(this));
        }
    }

    private handlePlayerState(playerState: any) {
        if (playerState) {
            this.game.getLogic().updatePlayerState(playerState.playerResources);
        }
    }

    private handleGameOver(data: {
        name: string;
        id: string;
        color: PlayerColor;
    }) {
        function displayGameOverScreen(
            winnerName: string,
            afterGameUrl: string,
        ): void {
            const root = document.getElementById("root");

            if (!root) {
                console.error("Root element not found.");
                return;
            }

            root.innerHTML = "";

            const message = document.createElement("h1");
            message.textContent = `🏆 ${winnerName} wins the game!`;
            message.style.textAlign = "center";
            message.style.marginBottom = "20px";

            const statsButton = document.createElement("button");
            statsButton.textContent = "View After-Game Statistics";
            statsButton.onclick = () => {
                window.location.href = afterGameUrl;
            };
            statsButton.style.padding = "10px 20px";
            statsButton.style.fontSize = "16px";
            statsButton.style.cursor = "pointer";
            statsButton.style.display = "block";
            statsButton.style.margin = "0 auto";
            statsButton.style.borderRadius = "0px";

            root.appendChild(message);
            root.appendChild(statsButton);
        }

        const clientBaseUrl = import.meta.env.VITE_CLIENT_BASE_URL;
        this.dispose();
        const afterGameUrl = `${clientBaseUrl}/game-client/game-over/${data.id}`;
        displayGameOverScreen(data.name, afterGameUrl);
    }

    private createCommand(commands: Command[]) {
        console.log("Creating commands:", commands);
        this.pendingCommands.push(...commands);
    }

    private setupCommandBatching() {
        this.commandInterval = window.setInterval(() => {
            if (this.pendingCommands.length > 0) {
                const commands = {
                    playerId: this.playerId,
                    pendingCommands: this.pendingCommands,
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
        this.socket.off("unit_created");
        this.socket.off("game_update");
        this.socket.disconnect();
    }
}
