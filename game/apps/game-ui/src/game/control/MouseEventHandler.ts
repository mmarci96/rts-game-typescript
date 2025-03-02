import { GameEntity } from "@packages/game-data";
import AssetManager from "../data/AssetManager";
import Camera from "../ui/Camera";
import SelectionBox from "../ui/SelectionBox";
import Drawable from "../data/Drawable";

class MouseEventHandler {
    #canvas: HTMLCanvasElement;
    #camera: Camera;
    #selectionBox: SelectionBox;
    selectionActive: boolean = false;
    #assets: AssetManager;
    #entities: Array<Drawable>;
    constructor(
        camera: Camera,
        selectionBox: SelectionBox,
        assets: AssetManager,
    ) {
        const canvas = document.getElementById("ui-canvas");
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error("Must be html canvas element ");
        }
        this.#canvas = canvas;

        this.#canvas.width = window.innerWidth;
        this.#canvas.height = window.innerHeight;
        this.#canvas.style.zIndex = "10";
        this.#camera = camera;
        this.#selectionBox = selectionBox;
        this.#assets = assets;
        this.#entities = [];
    }

    addCanvasEventListeners(drawables: Iterable<Drawable>) {
        this.#entities = Array.from(drawables);
        const ctx = this.#canvas.getContext("2d");
        if (!ctx) {
            throw new Error("no canvas");
        }
        let isSelecting = false;
        let startX = 0;
        let startY = 0;

        this.#canvas.addEventListener("mousedown", (e) => {
            if (e.button === 2) return;
            const rect = this.#canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            startY = e.clientY - rect.top;
            isSelecting = true;
        });

        this.#canvas.addEventListener("mousemove", (e) => {
            if (isSelecting) {
                this.onSelecting(e.clientX, e.clientY, startX, startY, ctx);
            }
            if (this.selectionActive) {
                //this.handleHover(e.clientX, e.clientY);
            }
        });

        this.#canvas.addEventListener("mouseup", (e) => {
            if (e.button === 2) return;
            //this.#units.forEach((u) => u.setSelected(false));
            console.log(e.clientX, e.clientY);
            const rect = this.#canvas.getBoundingClientRect();
            const finalX = e.clientX - rect.left;
            const finalY = e.clientY - rect.top;

            //[...this.#entities.values()].forEach((gameEntity: GameEntity) => {
            //    gameEntity.isSelected = false;
            //});

            console.log(this.#entities);

            this.#selectionBox.drawBox(startX, startY, finalX, finalY);
            ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
            isSelecting = false;
            //this.#selectables.push(...this.#units, ...this.#playerBuildings);

            const selectedUnits = this.#selectionBox.handleSelecting(
                this.#entities,
                this.#camera,
            );
            console.log(selectedUnits);

            //this.#entities = [];
            if (selectedUnits.length > 0) {
                this.selectionActive = true;
                //this.#uiOverlay.setVisible();
            } else {
                this.selectionActive = false;
                //this.#uiOverlay.setInvisible();
            }
            //this.#uiOverlay.displayUnitSelection(selectedUnits);
        });
        this.#canvas.addEventListener("mousedown", (e) => {
            if (e.button === 2) {
                //const target = this.getTargetPosition(
                //    this.#units,
                //    e.clientX,
                //    e.clientY,
                //);
                //mouseControl(target);
            }
        });
    }

    onSelecting(
        clientX: number,
        clientY: number,
        startX: number,
        startY: number,
        ctx: CanvasRenderingContext2D,
    ) {
        const rect = this.#canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;
        const currentX = screenX;
        const currentY = screenY;
        const width = currentX - startX;
        const height = currentY - startY;

        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        ctx.strokeStyle = "green";
        ctx.lineWidth = 1;
        ctx.strokeRect(startX, startY, width, height);
    }
}

export default MouseEventHandler;
