import Unit from "./Unit";
import { UnitParams } from "../../types";

class Archer extends Unit {
    constructor(parameters: UnitParams) {
        super(parameters);
    }

    getType(): string {
        return "archer";
    }
}

export default Archer;
