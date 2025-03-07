import Player from "../Player";
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
        if (this.#timePassed > 4) {
            this.#timePassed = 0;
            this.#collected += this.#collectingResource.collectResource(this.#capacity);
        } else {
            this.#timePassed += deltaTime;
            return 0;
        }
    }

    onLoadCollected(player: Player) {
        let loaded = true;
        const collected = this.#collected;
        if (!collected) return;
        const resourceType = this.#collectingResource?.getType();
        switch (resourceType) {
            case "wheat":
                const currentFood = player.getResources().food
                player.setFood(currentFood + collected)
                break;
            case "tree":
                const currentWood = player.getResources().wood;
                player.setWood(currentWood + collected);
                break;
            default:
                loaded = false;
                break;
        }

        if (loaded) {
            this.#collected = 0;
        }
    }

    getTarget() {
        return this.#collectingResource;
    }
}

export default Collector;
