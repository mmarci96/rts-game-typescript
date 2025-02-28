import { BuildingData, ResourceData, UnitData } from "@packages/game-data";

export interface GameState {
    units: UnitData[];
    resources: ResourceData[];
    buildings: BuildingData[];
}
