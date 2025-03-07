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
    update(deltaTime: number): void {
        const targetResource = this.collector.getTarget();
        if (targetResource) {
            const targetX = targetResource.getX();
            const targetY = targetResource.getY();

            this.movable.setTarget(targetX, targetY);
            const distance = calculateDistance(this.getPosition(), targetResource.getPosition());
            if (distance > 1) {
                this.setStatus("moving");
                this.movable.setTarget(targetX, targetY);
                this.updatePosition(deltaTime);
            } else {
                this.setStatus("mining")
                this.collector.updateCollect(deltaTime)
            }
        }
    }
    //updatePosition(deltaTime: number): void {
    //    const targetResource = this.collector.getTarget();
    //    if (targetResource) {
    //        const targetX = targetResource.getX();
    //        const targetY = targetResource.getY();
    //        const currentTarget = this.movable.getTarget();
    //        if (currentTarget.targetX !== targetX || currentTarget.targetY !== targetY) {
    //            this.movable.setTarget(targetX, targetY);
    //        }
    //        const { newX, newY, progress } = this.movable.move(this.getX(), this.getY(), deltaTime);
    //        this.setPosition({ x: newX, y: newY });
    //
    //        if (progress === "completed") {
    //            this.setStatus("mining");
    //            this.collector.collectResource(targetResource);
    //            this.movable.setTarget(null, null); // Clear target after arriving
    //        } else {
    //            this.setStatus("moving");
    //        }
    //    } else {
    //        super.updatePosition(deltaTime);
    //    }
    //}

    getType(): string {
        return "worker";
    }
}

export default Worker;
