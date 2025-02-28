import { Building, MainBuilding } from "../entities";
import { BuildingData } from "../types";
import { mapBuildingToBuildingParams } from "../utils";

class BuildingController {
    #buildings;
    constructor() {
        this.#buildings = new Map<string, Building>();
    }

    loadBuildings(buildingsData: BuildingData[]) {
        buildingsData.forEach((buildingData: BuildingData) => {
            const buildingParams = mapBuildingToBuildingParams(buildingData);
            switch (buildingData.type) {
                case "main":
                    const mainBuilding = new MainBuilding(buildingParams);
                    this.#buildings.set(mainBuilding.getId(), mainBuilding);
                    break;
                default:
                    break;
            }
        });
    }
    getBuildings() {
        return [...this.#buildings.values()];
    }
}

export default BuildingController;
