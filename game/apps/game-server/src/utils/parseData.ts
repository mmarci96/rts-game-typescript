import { IBuilding, IResource, IUnit } from "@packages/game-db";
import {
    UnitParams,
    ControlledEntityParams,
    BuildingParams,
    ResourceParams,
} from "@packages/game-data";

export const mapUnitToUnitParams = (unit: IUnit): UnitParams => {
    const controlledParams: ControlledEntityParams = {
        id: unit._id.toString(),
        position: unit.position,
        description: `A ${unit.type} unit`,
        color: unit.color,
        status: unit.state,
        size: unit.size,
    };

    return {
        controlledParams,
        health: unit.health,
        damage: unit.damage,
        speed: unit.speed,
    };
};

export const mapBuildingToBuildingParams = (
    building: IBuilding,
): BuildingParams => {
    const controlledParams = {
        id: building._id.toString(),
        position: building.position,
        description: `A ${building.type} building`,
        color: building.color,
        status: building.state,
        size: building.size,
    };

    return {
        controlledParams,
        health: building.health,
    };
};

export const mapResourceToResourceParams = (
    resource: IResource,
): ResourceParams => {
    return {
        id: resource._id.toString(),
        position: resource.position,
        description: `A ${resource.type} field`,
        availableResource: resource.availableResource,
        size: resource.size,
    };
};
