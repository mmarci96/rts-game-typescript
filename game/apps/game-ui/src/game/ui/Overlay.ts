import Camera from "./Camera";

class Overlay {
    #camera: Camera;
    #uiCanvas: HTMLCanvasElement;

    constructor(camera: Camera) {
        this.#camera = camera;
        const canvas = document.getElementById("ui-canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Must be html canvas element ");
        }
        this.#uiCanvas = canvas;
        this.#uiCanvas.width = window.innerWidth;
        this.#uiCanvas.height = window.innerHeight;
        this.#uiCanvas.style.zIndex = "10";
    }

    getContext() {
        const ctx = this.#uiCanvas.getContext("2d");
        return ctx;
    }
}

export default Overlay;
