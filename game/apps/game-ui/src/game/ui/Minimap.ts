import { Tile } from "@packages/game-data";
import Camera from "./Camera";

class Minimap {
    private tiles: Tile[][];
    private canvas: HTMLCanvasElement;
    private camera: Camera;

    constructor(tiles: Tile[][], camera: Camera) {
        this.tiles = tiles;
        this.camera = camera;

        const canvasElement = document.getElementById("minimap-canvas");
        if (!(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error(
                "Canvas element with ID 'map-canvas' not found or not a canvas element",
            );
        }
        this.canvas = canvasElement;
        this.canvas.height = 156;
        this.canvas.width = 156;
    }

    drawMinimap() {
        const cameraX = this.camera.getX();
        const cameraY = this.camera.getY();
        const cameraWidth = this.camera.getWidth();
        const cameraHeight = this.camera.getHeight();
        console.log("Camera location, x: ", cameraX, ", y: ", cameraY);
        console.log("Height: ", cameraHeight, ", Width: ", cameraWidth);

        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D rendering context for canvas");
        }
        const tileSize = 156 / this.tiles.length;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.tiles.length; y++) {
            const row = this.tiles[y];
            for (let x = 0; x < row.length; x++) {
                const tname = row[x].tile;
                ctx.fillStyle = tname === "water1" ? "blue" : "green";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }

        ctx.strokeStyle = "white"; // Set the color for the border
        ctx.lineWidth = 2; // (optional) Make the line a bit thicker if you want
        ctx.strokeRect(
            tileSize * cameraX,
            tileSize * cameraY,
            cameraWidth * tileSize,
            cameraHeight * tileSize,
        );
    }
}

export default Minimap;
