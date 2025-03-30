import { ResourceParams } from "../../types";
import Neutral from "../Neutral";

class Resource extends Neutral {
    private availableResource;

    constructor(params: ResourceParams) {
        super(params.id, params.position, params.description, params.size);
        this.availableResource = params.availableResource;
    }

    collectResource(amount: number) {
        if (this.availableResource < amount) {
            const remaining = this.availableResource;
            this.availableResource = 0;
            return remaining;
        }
        this.availableResource = this.availableResource - amount;
        return amount;
    }

    getAvailableResource() {
        return this.availableResource;
    }

    getType(): string {
        return "resource";
    }

    setAvailableResource(amount: number) {
        this.availableResource = amount;
    }
}

export default Resource;
