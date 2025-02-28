import {
    UnitParams,
    ControlledEntityParams,
    BuildingParams,
    ResourceParams,
    BuildingData,
    ResourceData,
    UnitData,
} from "@packages/game-data";

export const mapUnitToUnitParams = (unit: UnitData): UnitParams => {
    const controlledParams: ControlledEntityParams = {
        id: unit.id.toString(),
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
    building: BuildingData,
): BuildingParams => {
    const controlledParams = {
        id: building.id.toString(),
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
    resource: ResourceData,
): ResourceParams => {
    return {
        id: resource.id.toString(),
        position: resource.position,
        description: `A ${resource.type} field`,
        availableResource: resource.availableResource,
        size: resource.size,
    };
};
