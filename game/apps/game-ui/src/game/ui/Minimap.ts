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

        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D rendering context for canvas");
        }

        const mapWidth = this.tiles[0].length;
        const mapHeight = this.tiles.length;
        const tileWidth = this.canvas.width / mapWidth;
        const tileHeight = this.canvas.height / mapHeight;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < mapHeight; y++) {
            const row = this.tiles[y];
            for (let x = 0; x < mapWidth; x++) {
                const tname = row[x].tile;
                ctx.fillStyle = tname === "water1" ? "blue" : "green";
                ctx.fillRect(
                    x * tileWidth,
                    y * tileHeight,
                    tileWidth,
                    tileHeight,
                );
            }
        }

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            cameraX * tileWidth - (cameraWidth * tileWidth) / 2,
            cameraY * tileHeight - (cameraHeight * tileHeight) / 2,
            cameraWidth * tileWidth,
            cameraHeight * tileHeight,
        );
    }
}

export default Minimap;
