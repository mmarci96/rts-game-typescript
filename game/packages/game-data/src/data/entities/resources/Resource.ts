import { ResourceParams } from "../../types";
import Neutral from "../Neutral";

class Resource extends Neutral {
    #availableResource;

    constructor(params: ResourceParams) {
        super(params.id, params.position, params.description, params.size);
        this.#availableResource = params.availableResource;
    }

    collectResource(amount: number) {
        if (this.#availableResource <= 0) return 0;

        const collected = this.#availableResource - amount;
        if (collected >= 0) {
            this.#availableResource = collected;
            return amount;
        }

        this.#availableResource = 0;
        return amount + collected;
    }

    getAvailableResource() {
        return this.#availableResource;
    }
    getType(): string {
        return "resource";
    }
}

export default Resource;
