import { Building, Player, Resource, Unit } from "@packages/game-data/dist";
export interface LoadRequest {
    gameId: string;
    playerId: string;
}
export interface ConnectionData {
    gameId: string;
    playerId: string;
    player: Player;
}

export interface SaveGameStateParams {
    cacheUnits: (gameId: string, units: Unit[]) => Promise<void>;
    cacheBuildings: (gameId: string, buildings: Building[]) => Promise<void>;
    cacheResources: (gameId: string, resources: Resource[]) => Promise<void>;
}
