import { SVGProps } from "react";

export interface GameData {
    _id: string;
    mapId: string;
    status: string;
    maxPlayers: number;
    gameName?: string;
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
    PURPLE = "purple",
    YELLOW = "yellow",
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PATCH = "PATCH",
    DELETE = "DELETE",
    PUT = "PUT",
}

export interface Player {
    name: string;
    color: string;
    isReady: boolean;
    userId?: string;
    _id: string;
}

export interface UserData {
    id: string;
    email: string;
    username: string;
}

export interface UserContent {
    id: string | null;
    username: string | null;
    email: string | null;
}

export type UserContextType = {
    userData: UserContent;
    onLogin: (data: UserContent) => void;
    onLogout: () => void;
};

export type IconSvgProps = SVGProps<SVGSVGElement> & {
    size?: number;
};
