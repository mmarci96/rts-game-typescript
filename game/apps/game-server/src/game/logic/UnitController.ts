import { Archer, Unit, Worker, Warrior } from "@packages/game-data";
import { IUnit } from "@packages/game-db";
import { UnitType } from "@packages/game-db/dist/mongo-db/unit.model";
import { mapUnitToUnitParams } from "../../utils/parseData";

class UnitController {
    #units;
    constructor() {
        this.#units = new Map<string, Unit>();
    }

    loadUnits(unitsData: IUnit[]) {
        unitsData.forEach((unitData: IUnit) => {
            const unitParam = mapUnitToUnitParams(unitData);
            switch (unitData.type) {
                case UnitType.ARCHER:
                    const archer = new Archer(unitParam);
                    this.#units.set(archer.getId(), archer);
                    break;
                case UnitType.WORKER:
                    const worker = new Worker(unitParam);
                    this.#units.set(worker.getId(), worker);
                    break;
                case UnitType.WARRIOR:
                    const warrior = new Warrior(unitParam);
                    this.#units.set(warrior.getId(), warrior);
                    break;
                default:
                    console.log("unkown units");
                    break;
            }
        });
    }

    addUnit(unit: Unit) {
        this.#units.set(unit.getId(), unit);
    }
    getUnits() {
        return [...this.#units.values()];
    }
}

export default UnitController;
