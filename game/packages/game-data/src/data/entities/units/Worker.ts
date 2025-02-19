import Unit from "./Unit";
import { UnitParams } from "../../types";

class Worker extends Unit {
    constructor(parameters: UnitParams) {
        super(parameters);
    }

    getType(): string {
        return 'Worker';
    }
}

export default Worker;
