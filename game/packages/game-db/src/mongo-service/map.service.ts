import { MapModel, IMap } from "../mongo-db";

export const getMapById = async (
    mapId: string,
): Promise<IMap | null> => {
    const map = await MapModel.findById(mapId);
    if (!map) {
        return null;
    }
    return map;
};
