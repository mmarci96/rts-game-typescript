import { Types } from "mongoose";
import { MapModel, IMap } from "../mongo-db";

export const getMapById = async (
    mapId: Types.ObjectId,
): Promise<IMap | null> => {
    const map = await MapModel.findById(mapId);
    if (!map) {
        return null;
    }
    return map;
};
