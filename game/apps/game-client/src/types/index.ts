export interface GameData {
    _id: string;
    mapId: string;
    status: string;
    maxPlayers: number;
    createdAt: Date;
}

export interface GameMap {
    _id: string;
    type: string;
    size: string;
}
