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

export enum PlayerColor {
    RED = "red",
    BLUE = "blue",
    GREEN = "green",
    YELLOW = "yellow",
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    PUT = "PUT",
}
