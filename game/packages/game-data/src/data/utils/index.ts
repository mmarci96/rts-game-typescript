import {
    UnitParams,
    ControlledEntityParams,
    BuildingParams,
    UnitData,
    BuildingData,
    ResourceData,
    ResourceParams,
    Position,
} from "../types";

export const mapUnitToUnitParams = (unit: UnitData): UnitParams => {
    const controlledParams: ControlledEntityParams = {
        id: unit.id,
        position: unit.position,
        description: `A ${unit.unitType} unit`,
        color: unit.color,
        status: unit.state,
        size: unit.size,
    };

    return {
        controlledParams,
        health: unit.health,
        damage: unit.damage,
        target: unit.target,
        speed: unit.speed,
        attackSpeed: unit.attackSpeed,
    };
};

export const mapBuildingToBuildingParams = (
    building: BuildingData,
): BuildingParams => {
    const controlledParams = {
        id: building.id,
        position: building.position,
        description: `A ${building.buildingType} building`,
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
        id: resource.id,
        position: resource.position,
        description: `A ${resource.resourceType} field`,
        availableResource: resource.availableResource,
        size: resource.size,
    };
};

export const calculateDistance = (
    start: Position,
    target: Position,
) => {
    const dx = start.x - target.x;
    const dy = start.y - target.y;
    const distance = Math.sqrt((dx ** 2) + (dy ** 2))
    return distance;
}
