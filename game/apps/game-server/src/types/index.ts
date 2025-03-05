import { Building, Resource, Unit } from "@packages/game-data";

export interface PlayerCommand {
    action: string;
    entityId: string;
    targetX?: number;
    targetY?: number;
    targetId?: string;
    unitType?: string;
}

export interface SaveGameStateParams {
    cacheUnits: (gameId: string, units: Unit[]) => Promise<void>;
    cacheBuildings: (gameId: string, buildings: Building[]) => Promise<void>;
    cacheResources: (gameId: string, resources: Resource[]) => Promise<void>;
}
