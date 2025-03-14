export interface Position {
    x: number;
    y: number;
}

export interface Target {
    x: number | null;
    y: number | null;
    id: string | null;
}

export interface Size {
    width: number;
    height: number;
}

export enum PlayerColor {
    RED = "red",
    BLUE = "blue",
    PURPLE = "purple",
    YELLOW = "yellow",
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
    controlledParams: AttackableParams;
    damage: number;
    speed: number;
    target: Target;
    attackSpeed: number;
    attackRange: number;
}

export interface BuildingParams {
    controlledParams: AttackableParams;
}

export interface ResourceParams {
    id: string;
    position: Position;
    description: string;
    availableResource: number;
    size: Size;
}
export interface AttackableParams {
    controlledParams: ControlledEntityParams;
    health: number;
}

export interface UnitData {
    id: string;
    position: Position;
    color: PlayerColor;
    health: number;
    speed: number;
    damage: number;
    attackRange: number;
    attackSpeed: number;
    unitType: string;
    state: string;
    target: Target;
    size: Size;
    gameId: string;
}

export interface BuildingData {
    id: string;
    position: Position;
    color: PlayerColor;
    health: number;
    buildingType: string;
    state: string;
    size: Size;
    gameId: string;
}

export interface ResourceData {
    id: string;
    position: Position;
    availableResource: number;
    resourceType: string;
    size: Size;
    gameId: string;
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
    WHEAT = "wheat",
}

export interface Tile {
    x?: number;
    y?: number;
    z: number;
    tile: TileName;
}

export enum UnitType {
    ARCHER = "archer",
    WARRIOR = "warrior",
    WORKER = "worker",
}

export enum ResourceType {
    TREE = "tree",
    WHEAT = "wheatfield",
}

export interface UnitUpdateData {
    id: string;
    position: Position;
    target: Target;
    health: number;
    state: string;
}

export interface GameState {
    units: UnitData[];
    resources: ResourceData[];
    buildings: BuildingData[];
}

export interface PlayerResources {
    wood: number;
    food: number;
}

export interface IAttackable {
    getHealth(): number;
    getMaxHealth(): number;
    takeDamage(damage: number): void;
}

export interface IAttacker {
    attack(target: IAttackable): string;
    getAttackableTarget(): IAttackable | null;
    setAttackableTarget(target: IAttackable | null): void;
    getAttackRange(): number;
    canAttack(): boolean;
    resetTarget(): void;
    getAttackDamage(): number;
    getAttackSpeed(): number;
}



export interface IMovable {
    move(startX: number, startY: number, deltaTime: number): { newX: number; newY: number; progress: string };
    getTarget(): { targetX: number | null; targetY: number | null };
    setTarget(x: number | null, y: number | null): void;
    getSpeed(): number;
}
