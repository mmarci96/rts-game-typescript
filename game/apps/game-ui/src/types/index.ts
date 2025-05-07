import { PlayerColor, Tile } from "@packages/game-data";

export interface PlayerData {
    id: string;
    color: PlayerColor;
    gameId: string;
    name: string;
}

export interface MapData {
    id: string;
    tiles: Tile[][];
    type: string;
    size: string;
    createdAt: Date;
}
