import Unit from "./Unit";
import { UnitParams } from "../../types";

class Warrior extends Unit {
    constructor(parameters: UnitParams) {
        super(parameters);
    }

    getType(): string {
        return "warrior";
    }
}

export default Warrior;
