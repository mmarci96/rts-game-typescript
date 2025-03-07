import { ResourceData } from "../types";
import { Resource, WheatField, Tree } from "../entities";
import { mapResourceToResourceParams } from "../utils";

class ResourceController {
    #resources;
    constructor() {
        this.#resources = new Map<string, Resource>();
    }

    loadResources(resourcesData: ResourceData[]) {
        resourcesData.forEach((resourceData: ResourceData) => {
            const resourceParams = mapResourceToResourceParams(resourceData);
            switch (resourceData.resourceType) {
                case "wheatfield":
                    const wheatfield = new WheatField(resourceParams);
                    this.#resources.set(wheatfield.getId(), wheatfield);
                    break;
                case "tree":
                    const tree = new Tree(resourceParams);
                    this.#resources.set(tree.getId(), tree);
                    break;
                case "wheat":
                    const wheat = new WheatField(resourceParams);
                    this.#resources.set(wheat.getId(), wheat);
                    break;
                default:
                    break;
            }
        });
    }

    getResources() {
        return [...this.#resources.values()];
    }

    getResourceById(id: string) {
        return this.#resources.get(id);
    }
}

export default ResourceController;
