import { PlayerColor, Tile } from "@packages/game-data";

export interface Command {
    action: string;
    entityId: string;
    targetX?: number;
    targetY?: number;
    targetId?: string;
    unitType?: string;
}

export interface PlayerData {
    id: string;
    color: PlayerColor;
    gameId: string;
}

export interface MapData {
    id: string;
    tiles: Tile[][];
    type: string;
    size: string;
    createdAt: Date;
}


