import { Building, MainBuilding } from "../entities";
import { BuildingData, PlayerColor } from "../types";
import { mapBuildingToBuildingParams } from "../utils";

class BuildingController {
    #buildings;
    #deleted;

    constructor() {
        this.#buildings = new Map<string, Building>();
        this.#deleted = new Set<string>();
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
                this.#deleted.add(building.getId());
                this.#buildings.delete(building.getId());
                return;
            }
            if (building instanceof MainBuilding) {
                building.updateTraining(deltaTime);
            }
        });
    }
    getDeleted(): string[] {
        return [...this.#deleted.values()]
    }
    flushDeletedBuildings() {
        this.#deleted.clear();
    }

    getBuildingById(buildingId: string) {
        return this.#buildings.get(buildingId);
    }

    checkWinner(): PlayerColor | undefined {
        const colorPresence = new Set<PlayerColor>();
        for (const building of this.#buildings.values()) {
            if (building.getHealth() > 0) {
                colorPresence.add(building.getColor());
            }
        }
        if (colorPresence.size === 1) {
            return colorPresence.values().next().value;
        }
        return undefined;
    }
}

export default BuildingController;
