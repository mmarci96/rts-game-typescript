import { Building, BuildingData, MainBuilding } from "@packages/game-data";
import { mapBuildingToBuildingParams } from "../../utils/parseData";

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
}

export default BuildingController;
