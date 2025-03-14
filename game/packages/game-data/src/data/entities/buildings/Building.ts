import { BuildingParams } from "../../types";
import Attackable from "../Attackable";

class Building extends Attackable {

    constructor(parameters: BuildingParams) {
        super(parameters.controlledParams);
    }

    getActions(): string[] {
        return [];
    }
    getType(): string {
        return "building";
    }
}

export default Building;
