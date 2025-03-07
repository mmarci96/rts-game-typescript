import { Resource } from "./resources";
class Collector {
    #capacity: number;
    #collected: number = 0;
    #collectingResource: Resource | null = null;
    #timePassed: number = 0;

    constructor(capacity: number) {
        this.#capacity = capacity;
    }

    collectResource(resource: Resource) {
        this.#collectingResource = resource;
    }

    updateCollect(deltaTime: number) {
        if (!this.#collectingResource) {
            this.#timePassed = 0;
            return 0;
        }
        if (this.#timePassed > 1) {
            this.#timePassed = 0;
            this.#collected += this.#capacity;
            return this.#collected;
        } else {
            this.#timePassed += deltaTime;
            return 0;
        }
    }
    getCollected() {
        const amount = this.#collected;
        this.#collected = 0;
        return amount
    }


    getTarget() {
        return this.#collectingResource;
    }
}

export default Collector;
