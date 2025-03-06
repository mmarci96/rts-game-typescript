import { PlayerResources } from "@packages/game-data";

class StatusBar {
    element: HTMLDivElement;
    resourceElements: Map<string, HTMLSpanElement>;
    pingElement: HTMLDivElement;
    fpsElement: HTMLDivElement;

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
        this.pingElement.textContent = `Ping: ${Math.round(ms)}ms`;
    }

    setFps(deltaTime: number): void {
        const fps = deltaTime > 0 ? Math.round(1000 / deltaTime) : 0;
        this.fpsElement.textContent = `FPS: ${fps}`;
    }
}

export default StatusBar;
