import { Tile } from "@packages/game-data/dist";
import Camera from "./ui/Camera";
import VectorTransformer from "./utils/VectorTransformer";
import AssetManager from "./data/AssetManager";
import Game from "./Game";

class GameMapDrawer {
    #tiles: Tile[][];
    #assets: AssetManager;
    #camera: Camera;
    #canvas: HTMLCanvasElement;

    constructor(tiles: Tile[][], camera: Camera, assets: AssetManager) {
        this.#tiles = tiles;
        this.#assets = assets;
        this.#camera = camera;
        const canvasElement = document.getElementById("map-canvas");
        if (!(canvasElement instanceof HTMLCanvasElement)) {
            throw new Error(
                "Canvas element with ID 'map-canvas' not found or not a canvas element",
            );
        }
        this.#canvas = canvasElement;

        this.#canvas.style.zIndex = "0";
        this.#canvas.width = Game.WIDTH;
        this.#canvas.height = Game.HEIGHT;
    }
    drawMap() {
        const camera = this.#camera;
        const ctx = this.#canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get 2D rendering context for canvas");
        }

        ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);

        const cameraX = camera.getX();
        const cameraY = camera.getY();

        const minY = cameraY - camera.getHeight();
        const maxY = cameraY + camera.getHeight();

        const minX = cameraX - camera.getWidth();
        const maxX = cameraX + camera.getWidth();

        for (let y = minY; y <= maxY; y++) {
            if (y < 0 || y >= this.#tiles.length) {
                continue;
            }
            const row = this.#tiles[y];

            for (let x = minX; x <= maxX; x++) {
                if (x < 0 || x >= row.length) {
                    continue;
                }
                const { px, py } = VectorTransformer.positionToCanvas(
                    x,
                    y,
                    cameraX,
                    cameraY,
                );
                const name = row[x].tile;
                if (!name) continue;
                const tilesetImage = this.#assets.getImage(name);

                if (!tilesetImage) return;
                const position = { z: row[x].z * 128 };
                if (name !== "water1") {
                    position.z = position.z * 2;
                }

                ctx.drawImage(tilesetImage, px, py - position.z);
            }
        }
    }

    getMapSize() {
        const mapHeight = this.#tiles.length;
        const mapWidth = this.#tiles[0].length;
        return { mapWidth, mapHeight };
    }
}

export default GameMapDrawer;
