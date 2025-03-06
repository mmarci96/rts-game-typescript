import { MapModel } from "@packages/game-db";
import { Types } from "mongoose";

export const getMaps = async () => {
    const maps = await MapModel.find().select("_id type size");
    if (!maps) {
        throw new Error("No maps found!");
    }

    return maps;
};

export const getMapById = async (mapId: Types.ObjectId) => {
    const map = await MapModel.findById(mapId);
    if (!map) {
        throw new Error("Map not found with id: " + mapId.toString());
    }

    return map;
};
