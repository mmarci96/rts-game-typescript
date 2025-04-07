import { Socket, io } from "socket.io-client";
interface Command {
    action: string;
}
class ConnectionHandler {
    private socket: Socket;
    private playerId: string;
    private gameId: string;
    private pendingCommands: Command[] = [];
    private lastPingTime = Date.now();
    private commandInterval: number = 0;

    constructor(socket: Socket, playerId: string, gameId: string) {
        this.socket = socket;
        this.playerId = playerId;
        this.gameId = gameId;

        this.initializeSocketHandlers();
        this.setupCommandBatching();
    }
    public getCredentials() {
        return { playerId: this.playerId, gameId: this.gameId };
    }

    public static async initialize() {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        const { gameId, playerId } = this.getIdFromUrl(
            window.location.pathname,
        );
        const socket = io();

        return new ConnectionHandler(socket, playerId, gameId);
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
        this.socket.on("game_state", (data) => this.handleGameState(data));
        this.socket.on("player_state", (data) => this.handlePlayerState(data));
    }
    private updateRefreshRate() {
        const now = Date.now();
        const deltaTimeMs = now - this.lastPingTime;
        this.lastPingTime = now;
        console.log("deltaTimeMs:", deltaTimeMs);
    }

    private handleConnect() {
        console.log("Connected to server");
        this.socket.emit("load_game", {
            playerId: this.playerId,
            gameId: this.gameId,
        });
    }

    private handleGameState(data: {}) {
        this.updateRefreshRate();
        console.log(data);
    }

    private handlePlayerState(playerState: any) {
        console.log(playerState);
    }
    public createCommand(commands: Command[]) {
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

window.addEventListener("load", async () => {
    try {
        const handler = await ConnectionHandler.initialize();
        const button = document.createElement("button");
        button.textContent = "Click me to send comand";
        button.addEventListener("click", () => {
            const { gameId, playerId } = handler.getCredentials();
            const commands: Command[] = [
                { action: `command:${gameId}:${playerId}` },
            ];
            handler.createCommand(commands);
        });
        document.getElementById("root")?.appendChild(button);
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
