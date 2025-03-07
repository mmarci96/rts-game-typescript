import Unit from "./Unit";
import { UnitParams } from "../../types";
import Collector from "../Collector";

class Worker extends Unit {
    collector: Collector;
    constructor(parameters: UnitParams) {
        super(parameters);
        this.collector = new Collector(5);
    }

    getType(): string {
        return "worker";
    }
}

export default Worker;
