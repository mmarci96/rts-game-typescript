import { ResourceModel } from "../mongo-db";

export const getResourcesByGameId = async (gameId: string) => {
    await ResourceModel.deleteMany({
        gameId,
        availableResource: 0,
    });
    const resources = await ResourceModel.find({ gameId });
    return resources;
};

export const updateResource = async (
    resourceId: string,
    availableResource: number,
) => {
    if (availableResource <= 0) {
        return await ResourceModel.findByIdAndDelete(resourceId);
    }
    const resource = await ResourceModel.findByIdAndUpdate(
        resourceId,
        { $set: { availableResource } },
        { upsert: true, new: true },
    );
    return resource;
};
