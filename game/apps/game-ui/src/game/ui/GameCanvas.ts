import Camera from "./Camera";
import Game from "../Game";

class GameCanvas {
    #camera: Camera;
    #gameCanvas: HTMLCanvasElement;

    constructor(camera: Camera) {
        this.#camera = camera;
        const gameCanvas = document.getElementById("game-canvas");
        if (!(gameCanvas instanceof HTMLCanvasElement)) {
            throw new Error("Must be html canvas element ");
        }
        this.#gameCanvas = gameCanvas;
        this.#gameCanvas.width = Game.WIDTH;
        this.#gameCanvas.height = Game.HEIGHT;
        this.#gameCanvas.style.zIndex = "3";
    }

    getContext() {
        const ctx = this.#gameCanvas.getContext("2d");
        return ctx;
    }
}

export default GameCanvas;
