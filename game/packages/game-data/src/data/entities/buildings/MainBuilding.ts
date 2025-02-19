import { BuildingParams } from "../../types";
import Building from "./Building";

class MainBuilding extends Building {
    constructor(parameters: BuildingParams) {
        super(parameters);
    }

    createUnit(unitType: string) {
        console.log("Creating unit with type: ", unitType)
    }
}

export default MainBuilding;
