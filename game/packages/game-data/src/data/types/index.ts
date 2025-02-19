export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
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
    description: string;
    color: PlayerColor;
    status: string;
    size: Size;
}

export interface UnitParams {
    controlledParams: ControlledEntityParams;
    health: number;
    damage: number;
    speed: number;
}

export interface BuildingParams {
    controlledParams: ControlledEntityParams,
    health: number,
}

export interface ResourceParams {
    id: string;
    position: Position;
    description: string;
    availableResource: number;
    size: Size;
}
