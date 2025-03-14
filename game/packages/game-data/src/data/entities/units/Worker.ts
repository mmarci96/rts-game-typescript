import Unit from "./Unit";
import { UnitParams } from "../../types";
import Collector from "../Collector";
import { calculateDistance } from "../../utils";

class Worker extends Unit {
    collector: Collector;

    constructor(parameters: UnitParams) {
        super(parameters);
        this.collector = new Collector(5);
    }

    getCollector() {
        return this.collector
    }

    mining(deltaTime: number): void {
        const targetResource = this.collector.getTarget();
        if (targetResource) {
            const targetX = targetResource.getX();
            const targetY = targetResource.getY();
            this.setTarget(targetX, targetY);
            const distance = calculateDistance(this.getPosition(), targetResource.getPosition());
            if (distance > 1.6) {
                this.setStatus("moving");
                this.setTarget(targetX, targetY);
                this.updatePosition(deltaTime);
            } else {
                this.setStatus("mining")
                this.collector.updateCollect(deltaTime)
            }
            return;
        }
    }

    getType(): string {
        return "worker";
    }
}

export default Worker;
