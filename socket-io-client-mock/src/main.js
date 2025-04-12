import { io } from "socket.io-client";
class ConnectionHandler {
    constructor(socket, playerId, gameId) {
        this.socket = socket;
        this.playerId = playerId;
        this.gameId = gameId;
        this.pendingCommands = [];
        this.lastPingTime = Date.now();
        this.commandInterval = 0;

        this.initializeSocketHandlers();
        this.setupCommandBatching();
    }

    static initialize() {
        document.addEventListener("contextmenu", (e) => e.preventDefault());
        const { gameId, playerId } = this.getIdFromUrl(
            window.location.pathname,
        );
        const socket = io(`/ws/${gameId}`, {
            path: `/ws/${gameId}`,
        });

        return new ConnectionHandler(socket, playerId, gameId);
    }

    static getIdFromUrl(url) {
        const arr = url.split("/");
        const lastIndex = arr.length - 1;
        return {
            gameId: arr[lastIndex - 1],
            playerId: arr[lastIndex],
        };
    }

    initializeSocketHandlers() {
        this.socket.on("connect", () => this.handleConnect());
        this.socket.on("game_state", (data) => this.handleGameState(data));
        this.socket.on("player_state", (data) => this.handlePlayerState(data));
    }

    updateRefreshRate() {
        const now = Date.now();
        const deltaTimeMs = now - this.lastPingTime;
        this.lastPingTime = now;
        console.log("deltaTimeMs:", deltaTimeMs);
    }

    handleConnect() {
        console.log("Connected to server");
        this.socket.emit("load_game", {
            playerId: this.playerId,
            gameId: this.gameId,
        });
    }

    handleGameState(data) {
        this.updateRefreshRate();
        console.log("Game State:", data);
    }

    handlePlayerState(playerState) {
        console.log("Player State:", playerState);
    }

    createCommand(command) {
        console.log("Creating commands:", command);
        this.pendingCommands.push(command);
    }

    setupCommandBatching() {
        this.commandInterval = setInterval(() => {
            if (this.pendingCommands.length > 0) {
                const commandData = {
                    playerId: this.playerId,
                    pendingCommands: this.pendingCommands,
                };
                this.socket.emit("pending_commands", commandData);
                console.log("Sent commands, data:", commandData);
                this.pendingCommands = [];
            }
        }, 60);
    }

    dispose() {
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
window.addEventListener("load", () => {
    try {
        const handler = ConnectionHandler.initialize();
        const connData = {
            gameId: handler.gameId,
            playerId: handler.playerId,
        };

        // Add a test button
        const button = document.createElement("button");
        button.textContent = "Click me to send command";
        button.addEventListener("click", () => {
            const commands = {
                action: `action:${connData.gameId}:${connData.playerId}`,
                data: {},
            };
            handler.createCommand(commands);
        });

        document.getElementById("root")?.appendChild(button);
    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
});
