import Camera from "../ui/Camera";
import VectorTransformer from "../utils/VectorTransformer";

class Selectable {
    #screenX: number;
    #screenY: number;
    #camera: Camera;
    constructor(x: number, y: number, camera: Camera) {
        this.#camera = camera;
        const { px, py } = VectorTransformer.positionToCanvas(
            x,
            y,
            this.#camera.getX(),
            this.#camera.getY(),
        );
        this.#screenX = px;
        this.#screenY = py;
    }
    setPosition(px: number, py: number) {
        this.#screenX = px;
        this.#screenY = py;
    }
    getX() {
        return this.#screenX;
    }
    getY() {
        return this.#screenY;
    }
}

export default Selectable;
