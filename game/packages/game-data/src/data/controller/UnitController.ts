import { UnitData, UnitType, UnitUpdateData, PlayerColor } from "../types";
import { mapUnitToUnitParams } from "../utils";
import { Unit, Archer, Worker, Warrior } from "../entities";

class UnitController {
    #units;
    constructor() {
        this.#units = new Map<string, Unit>();
    }

    loadUnits(unitsData: UnitData[]) {
        unitsData.forEach((unitData: UnitData) => this.loadUnit(unitData));
    }

    updateUnits(unitUpdatesData: UnitUpdateData[]) {
        unitUpdatesData.forEach((unitUpdateData: UnitUpdateData) =>
            this.updateUnit(unitUpdateData),
        );
    }

    getUnitsByColor(color: PlayerColor) {
        return this.getUnits().filter(
            (unit: Unit) => unit.getColor() === color,
        );
    }

    getEnemyUnits(allyColor: PlayerColor) {
        return this.getUnits().filter(
            (unit: Unit) => unit.getColor() !== allyColor,
        );
    }

    addUnit(unit: Unit) {
        this.#units.set(unit.getId(), unit);
    }

    removeUnit(unitId: string) {
        this.#units.delete(unitId);
    }

    getUnits() {
        return [...this.#units.values()];
    }

    getUnitById(id: string): Unit | null {
        const unit = this.#units.get(id);
        if (!unit) return null;
        return unit;
    }

    updateUnit(unitUpdateData: UnitUpdateData) {
        const unit = this.getUnitById(unitUpdateData.id);
        if (!unit) {
            return;
        }
        unit.setPosition(unitUpdateData.position);
        unit.setStatus(unitUpdateData.state);
        unit.setTarget(unitUpdateData.target);
    }

    loadUnit(unitData: UnitData) {
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
    }
}

export default UnitController;
