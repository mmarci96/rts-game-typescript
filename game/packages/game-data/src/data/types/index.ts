export interface Position {
    x: number;
    y: number;
}

export enum PlayerColor {
    RED = 'red',
    BLUE = 'blue',
    PURPLE = 'purple',
    YELLOW = 'yellow'
}

export interface ControlledEntityParams {
    id: string;
    position: Position;
    description?: string;
    color: PlayerColor;
    status: string;
}


