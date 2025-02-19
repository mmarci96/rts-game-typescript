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

export enum TileName {
    DIRECTIONAL_SIGN = "directional_sign",
    DIRT = "dirt",
    FENCE = "fence",
    FENCE10 = "fence10",
    FENCE11 = "fence11",
    FENCE2 = "fence2",
    FENCE3 = "fence3",
    FENCE4 = "fence4",
    FENCE5 = "fence5",
    FENCE6 = "fence6",
    FENCE7 = "fence7",
    FENCE8 = "fence8",
    FENCE9 = "fence9",
    GRASS1 = "grass1",
    LANTERN1 = "lantern1",
    LANTERN2 = "lantern2",
    LANTERN3 = "lantern3",
    LANTERN4 = "lantern4",
    PAVEMENT1 = "pavement1",
    PAVEMENT2 = "pavement2",
    SCARECROW = "scarecrow",
    STONE = "stone",
    STONE2 = "stone2",
    STONE_SLAB = "stone_slab",
    STONE_STAIR = "stone_stair",
    WATER1 = "water1",
    WHEAT = "wheat"
}

export interface Tile {
    x: number;
    y: number;
    z: number;
    name: TileName;
}
