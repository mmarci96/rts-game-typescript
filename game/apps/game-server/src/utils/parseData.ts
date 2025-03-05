import { UnitData, Target } from "@packages/game-data";
import { IUnit } from "@packages/game-db";

export const mapMongoUnitToData = (mongoUnit: IUnit): UnitData => {
    const target: Target = {
        x: mongoUnit.target.x,
        y: mongoUnit.target.y,
        id: mongoUnit.target.id ? mongoUnit.target.id.toString() : null,
    };

    return {
        id: mongoUnit._id.toString(),
        position: mongoUnit.position,
        color: mongoUnit.color,
        state: mongoUnit.state,
        size: mongoUnit.size,
        health: mongoUnit.health,
        damage: mongoUnit.damage,
        target: target,
        speed: mongoUnit.speed,
        unitType: mongoUnit.unitType,
        attackSpeed: mongoUnit.attackSpeed,
        gameId: mongoUnit.gameId.toString(),
    };
};
