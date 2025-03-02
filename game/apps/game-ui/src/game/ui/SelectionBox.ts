import Drawable from "../data/Drawable";
import VectorTransformer from "../utils/VectorTransformer";
import Camera from "./Camera";

class SelectionBox {
    #startX;
    #startY;
    #finalX;
    #finalY;

    constructor() {
        this.#startX = 0;
        this.#startY = 0;
        this.#finalY = 0;
        this.#finalX = 0;
    }

    /**
     * @param { number } startX
     * @param { number } startY
     * @param { number } endX
     * @param { number } endY
     */
    drawBox(startX: number, startY: number, endX: number, endY: number) {
        this.#startX = startX;
        this.#startY = startY;
        this.#finalX = endX;
        this.#finalY = endY;
    }

    handleSelecting(drawables: Drawable[], camera: Camera) {
        const selectionRect = {
            left: Math.min(this.#startX, this.#finalX) + 28,
            top: Math.min(this.#startY, this.#finalY) + 28,
            right: Math.max(this.#startX, this.#finalX) + 28,
            bottom: Math.max(this.#startY, this.#finalY) + 28,
        };

        return drawables.filter((drawable: Drawable) => {
            const { px, py } = VectorTransformer.positionToCanvas(
                drawable.entity.getX(),
                drawable.entity.getY(),
                camera.getX(),
                camera.getY(),
            );

            const unitRect = {
                left: px,
                top: py,
                right: px + 48,
                bottom: py + 48,
            };

            const isPartiallyInside =
                selectionRect.right >= unitRect.left &&
                selectionRect.left <= unitRect.right &&
                selectionRect.bottom >= unitRect.top &&
                selectionRect.top <= unitRect.bottom;

            drawable.entity.isSelected = isPartiallyInside;

            return drawable.entity.isSelected;
        });
    }
}

export default SelectionBox;
