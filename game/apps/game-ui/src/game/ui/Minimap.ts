import { Tile } from "@packages/game-data";

class Minimap {
    private tiles: Tile[][];
    private canvas: HTMLCanvasElement;
    constructor(tiles: Tile[][]) {
        this.tiles = tiles;

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
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D rendering context for canvas");
        }
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.tiles.length; y++) {
            const row = this.tiles[y];
            for (let x = 0; x < row.length; x++) {
                console.log(row[x]);

                const tileSize = 156 / row.length;
                const tname = row[x].tile;
                ctx.fillStyle = tname === "water1" ? "blue" : "green";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}

export default Minimap;
