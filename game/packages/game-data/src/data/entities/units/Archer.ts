import Unit from "./Unit";
import { UnitParams } from "../../types";
import { AStar } from "../../utils/pathfinding";

class Archer extends Unit {
    constructor(parameters: UnitParams, aStar: AStar | null) {
        super(parameters, aStar);
    }

    getType(): string {
        return "archer";
    }
}

export default Archer;
