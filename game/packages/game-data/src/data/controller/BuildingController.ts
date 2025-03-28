import { Building, MainBuilding } from "../entities";
import { BuildingData, PlayerColor } from "../types";
import { mapBuildingToBuildingParams } from "../utils";

class BuildingController {
    #buildings;

    constructor() {
        this.#buildings = new Map<string, Building>();
    }

    loadBuildings(buildingsData: BuildingData[]) {
        buildingsData.forEach((buildingData: BuildingData) => {
            const buildingParams = mapBuildingToBuildingParams(buildingData);
            switch (buildingData.buildingType) {
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

    refreshBuilding(deltaTime: number) {
        [...this.#buildings.values()].forEach((building: Building) => {
            if (building.getHealth() <= 0) {
                this.#buildings.delete(building.getId());
                return;
            }
            if (building instanceof MainBuilding) {
                building.updateTraining(deltaTime);
            }
        });
    }

    getBuildingById(buildingId: string) {
        return this.#buildings.get(buildingId);
    }
}

export default BuildingController;
