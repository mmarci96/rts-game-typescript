import { IUnit } from "@packages/game-db";
import { UnitParams, ControlledEntityParams } from "@packages/game-data";

const mapUnitToUnitParams = (unit: IUnit): UnitParams => {
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

export default mapUnitToUnitParams;
