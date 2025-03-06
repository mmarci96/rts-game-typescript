import { Resource } from "./resources";
class Collector {
    #capacity: number;
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
        if (this.#timePassed > 4) {
            this.#timePassed = 0;
            return this.#collectingResource.collectResource(this.#capacity);
        } else {
            this.#timePassed += deltaTime;
            return 0;
        }
    }
}

export default Collector;
