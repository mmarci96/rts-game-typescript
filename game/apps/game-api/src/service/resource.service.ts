import { IResource, ResourceModel } from "@packages/game-db/dist";
import { Types } from "mongoose";

export const generateResources = async (
    mapSize: number,
    gameId: Types.ObjectId,
) => {
    const resources: IResource[] = [];
    const resourceSize = { width: 32, height: 32 };
    const availableResource = 200;

    const treeClusterChance = 0.7;
    const clusterRadius = 20;

    const positions = new Set();

    for (let i = 0; i < mapSize / 4; i++) {
        let x, y;
        let currentType = Math.random() < 0.6 ? "tree" : "wheatfield";

        if (
            currentType === "tree" &&
            Math.random() < treeClusterChance &&
            resources.length > 0
        ) {
            const existingTree = resources.find(
                (r) => r.resourceType === "tree",
            );
            if (existingTree) {
                x =
                    existingTree.position.x +
                    Math.floor(
                        Math.random() * clusterRadius - clusterRadius / 2,
                    );
                y =
                    existingTree.position.y +
                    Math.floor(
                        Math.random() * clusterRadius - clusterRadius / 2,
                    );
            }
        }

        if (!x || !y || positions.has(`${x},${y}`)) {
            x = Math.floor(Math.random() * mapSize);
            y = Math.floor(Math.random() * mapSize);
        }

        positions.add(`${x},${y}`);

        resources.push(
            new ResourceModel({
                _id: new Types.ObjectId(),
                position: { x, y },
                availableResource,
                resourceType: currentType,
                gameId,
                size: resourceSize,
                createdAt: new Date(),
                updatedAt: new Date(),
            }),
        );
    }

    return await ResourceModel.insertMany(resources);
};
