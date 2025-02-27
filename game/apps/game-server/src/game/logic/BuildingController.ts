import { Building } from "@packages/game-data";
import { IBuilding } from "@packages/game-db";

class BuildingController {
    #buildings;
    constructor() {
        this.#buildings = new Map<string, Building>();
    }

    loadBuildings(buildings: IBuilding[]) {}
}

export default BuildingController;
