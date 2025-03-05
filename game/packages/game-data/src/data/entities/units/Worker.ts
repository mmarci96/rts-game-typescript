import Unit from "./Unit";
import { UnitParams } from "../../types";

class Worker extends Unit {
    constructor(parameters: UnitParams) {
        super(parameters);
    }

    getType(): string {
        return "worker";
    }
}

export default Worker;
