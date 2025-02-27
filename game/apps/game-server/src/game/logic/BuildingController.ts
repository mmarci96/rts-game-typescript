import { Building, MainBuilding } from "@packages/game-data";
import { IBuilding } from "@packages/game-db";
import { mapBuildingToBuildingParams } from "../../utils/parseData";

class BuildingController {
    #buildings;
    constructor() {
        this.#buildings = new Map<string, Building>();
    }

    loadBuildings(buildingsData: IBuilding[]) {
        buildingsData.forEach((buildingData: IBuilding) => {
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
