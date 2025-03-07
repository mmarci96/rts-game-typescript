import { PlayerResources } from "@packages/game-data";

class StatusBar {
    element: HTMLDivElement;
    resourceElements: Map<string, HTMLSpanElement>;
    pingElement: HTMLDivElement;
    fpsElement: HTMLDivElement;

    private fpsSamples: number[] = [];
    private pingSamples: number[] = [];
    private lastUpdateTime: number = Date.now();
    constructor() {
        const resources: PlayerResources = { wood: 0, food: 0 };
        this.element = document.createElement("div");
        Object.assign(this.element.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "#e0e0e0",
            zIndex: "20",
            display: "flex",
            justifyContent: "space-between",
            padding: "4px 16px",
            boxSizing: "border-box",
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
        });

        const leftContainer = document.createElement("div");
        Object.assign(leftContainer.style, {
            display: "flex",
            gap: "20px",
        });

        this.resourceElements = new Map();
        for (const [name, value] of Object.entries(resources)) {
            const container = document.createElement("div");
            Object.assign(container.style, {
                display: "flex",
                gap: "4px",
            });

            const nameSpan = document.createElement("span");
            nameSpan.textContent = `${name}:`;

            const valueSpan = document.createElement("span");
            valueSpan.textContent = value.toString();

            container.appendChild(nameSpan);
            container.appendChild(valueSpan);
            leftContainer.appendChild(container);
            this.resourceElements.set(name, valueSpan);
        }

        const rightContainer = document.createElement("div");
        Object.assign(rightContainer.style, {
            display: "flex",
            gap: "20px",
        });

        this.pingElement = document.createElement("div");
        this.pingElement.textContent = "Ping: 0ms";

        this.fpsElement = document.createElement("div");
        this.fpsElement.textContent = "FPS: 0";

        rightContainer.appendChild(this.pingElement);
        rightContainer.appendChild(this.fpsElement);

        this.element.appendChild(leftContainer);
        this.element.appendChild(rightContainer);
    }

    setResource(name: string, value: number): void {
        const element = this.resourceElements.get(name);
        if (element) {
            element.textContent = value.toString();
        }
    }

    setPing(ms: number): void {
        this.pingSamples.push(ms);
        this.checkAndUpdate();
    }

    setFps(deltaTimeMs: number): void {
        this.fpsSamples.push(deltaTimeMs);
        this.checkAndUpdate();
    }

    private checkAndUpdate(): void {
        const now = Date.now();
        if (now - this.lastUpdateTime >= 1000) {
            this.updateDisplay(now);
        }
    }

    private updateDisplay(now: number): void {
        // Calculate averaged FPS
        let fps = 0;
        if (this.fpsSamples.length > 0) {
            const averageFrameTime =
                this.fpsSamples.reduce((a, b) => a + b, 0) /
                this.fpsSamples.length;
            fps = Math.round(1000 / averageFrameTime);
        }
        this.fpsElement.textContent = `FPS: ${fps}`;

        // Calculate averaged ping
        let ping = 0;
        if (this.pingSamples.length > 0) {
            ping =
                this.pingSamples.reduce((a, b) => a + b, 0) /
                this.pingSamples.length;
        }
        this.pingElement.textContent = `Ping: ${Math.round(ping)}ms`;

        // Reset samples and update time
        this.fpsSamples = [];
        this.pingSamples = [];
        this.lastUpdateTime = now;
    }
}

export default StatusBar;
