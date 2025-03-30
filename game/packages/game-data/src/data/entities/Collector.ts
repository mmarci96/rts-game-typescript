import { ICollector } from "../types";
import { Resource } from "./resources";

class Collector implements ICollector {
    private capacity: number;
    private collected: number = 0;
    private collectingResource: Resource | null = null;
    private timePassed: number = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    collectResource(resource: Resource) {
        this.collectingResource = resource;
    }

    updateCollect(deltaTime: number) {
        if (!this.collectingResource) {
            this.timePassed = 0;
            return 0;
        }
        if (this.timePassed > 5) {
            this.timePassed = 0;
            this.collected += this.capacity;
            return this.collected;
        } else {
            this.timePassed += deltaTime;
            return 0;
        }
    }
    getCollected() {
        const amount = this.collected;
        this.collected = 0;
        return amount
    }

    getTargetResource() {
        return this.collectingResource;
    }

    resetTargetResource(): void {
        this.collectingResource = null;
    }
}

export default Collector;
