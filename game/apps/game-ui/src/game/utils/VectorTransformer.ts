import Game from "../Game";

export default class VectorTransformer {
    static positionToCanvas(
        posX: number,
        posY: number,
        cameraX: number,
        cameraY: number,
    ) {
        const tileWidth = 48;
        const tileHeight = 24;
        const offsetX = Game.WIDTH * 0.5;
        const offsetY = Game.HEIGHT * 0.5;
        const position = {
            px: (posX - cameraX - (posY - cameraY)) * (tileWidth / 2) + offsetX,
            py:
                (posX - cameraX + (posY - cameraY)) * (tileHeight / 2) +
                offsetY,
        };
        return position;
    }
    static getPositionFromCanvas(
        screenX: number,
        screenY: number,
        cameraX: number,
        cameraY: number,
    ) {
        const tileWidth = 48;
        const tileHeight = 24;
        const offsetX = Game.WIDTH * 0.5;
        const offsetY = Game.HEIGHT * 0.5;

        const adjustedX = screenX - offsetX;
        const adjustedY = screenY - offsetY;

        const worldX =
            (adjustedX / (tileWidth / 2) + adjustedY / (tileHeight / 2)) / 2 +
            cameraX;
        const worldY =
            (adjustedY / (tileHeight / 2) - adjustedX / (tileWidth / 2)) / 2 +
            cameraY;

        return { worldX, worldY };
    }
}
