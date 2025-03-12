import { Types } from "mongoose";
import { MapModel, IMap } from "../mongo-db";

export const getMapById = async (
    mapId: string,
): Promise<IMap | null> => {
    const id = new Types.ObjectId(mapId)
    const map = await MapModel.findById(id);
    if (!map) {
        return null;
    }
    return map;
};
