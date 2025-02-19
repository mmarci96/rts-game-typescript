import { BuildingParams } from "../../types";
import Attackable from "../Attackable";
import ControlledEntity from "../ControlledEntity";

class Building extends ControlledEntity {
    attackable;

    constructor(parameters: BuildingParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health)
    }
}

export default Building;
