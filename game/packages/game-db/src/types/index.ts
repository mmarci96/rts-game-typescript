import { IBuilding, IResource, IUnit } from "../mongo-db";

export interface GameEntityData {
    units: IUnit[];
    resources: IResource[];
    buildings: IBuilding[];
}
