import { Resource, Tree, WheatField } from "@packages/game-data";
import { IResource } from "@packages/game-db";
import { mapResourceToResourceParams } from "../../utils/parseData";

class ResourceController {
    #resources;
    constructor() {
        this.#resources = new Map<string, Resource>();
    }

    loadResources(resourcesData: IResource[]) {
        resourcesData.forEach((resourceData: IResource) => {
            const resourceParams = mapResourceToResourceParams(resourceData);
            switch (resourceData.type) {
                case "wheatfield":
                    const wheatfield = new WheatField(resourceParams);
                    this.#resources.set(wheatfield.getId(), wheatfield);
                    break;
                case "tree":
                    const tree = new Tree(resourceParams);
                    this.#resources.set(tree.getId(), tree);
                default:
                    break;
            }
        });
    }
}

export default ResourceController;
