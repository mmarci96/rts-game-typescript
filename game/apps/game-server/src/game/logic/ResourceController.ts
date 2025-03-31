import {
    Resource,
    WheatField,
    Tree,
    mapResourceToResourceParams,
    ResourceData,
} from "@packages/game-data/dist";
class ResourceController {
    private resources;
    constructor() {
        this.resources = new Map<string, Resource>();
    }

    loadResources(resourcesData: ResourceData[]) {
        resourcesData.forEach((resourceData: ResourceData) => {
            const resourceParams = mapResourceToResourceParams(resourceData);
            switch (resourceData.resourceType) {
                case "wheatfield":
                    const wheatfield = new WheatField(resourceParams);
                    this.resources.set(wheatfield.getId(), wheatfield);
                    break;
                case "tree":
                    const tree = new Tree(resourceParams);
                    this.resources.set(tree.getId(), tree);
                    break;
                case "wheat":
                    const wheat = new WheatField(resourceParams);
                    this.resources.set(wheat.getId(), wheat);
                    break;
                default:
                    break;
            }
        });
    }

    updateResources() {
        this.resources.forEach((resource: Resource, id: string) => {
            if (resource.getAvailableResource() <= 0) {
                this.resources.delete(id);
            }
        });
    }

    getResources() {
        return [...this.resources.values()];
    }

    getResourceById(id: string) {
        return this.resources.get(id);
    }
}

export default ResourceController;
