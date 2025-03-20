import {
    UnitData,
    Unit, PlayerColor,
    Archer,
    Warrior,
    Worker,
    mapUnitToUnitParams
} from "@packages/game-data/dist";

class UnitManager {
    #units;

    constructor() {
        this.#units = new Map<string, Unit>();
    }

    loadUnits(unitsData: UnitData[]) {
        unitsData.forEach((unitData: UnitData) => this.loadUnit(unitData));
    }

    getUnitsByColor(color: PlayerColor) {
        return this.getUnits().filter(
            (unit: Unit) => unit.getColor() === color,
        );
    }

    getUnitIds() {
        return [...this.#units.keys()];
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

    updateUnitWithData(unit: Unit, unitData: UnitData) {
        unit.setStatus(unitData.state);
        unit.setPosition(unitData.position);
        unit.setTarget(unitData.target.x, unitData.target.y);
        unit.setHealth(unitData.health);
    }

    loadUnit(unitData: UnitData) {
        const existing = this.#units.get(unitData.id);
        if (existing) {
            this.updateUnitWithData(existing, unitData);
            return;
        }
        const unitParam = mapUnitToUnitParams(unitData);
        switch (unitData.unitType) {
            case "archer":
                const archer = new Archer(unitParam, null);
                this.#units.set(archer.getId(), archer);
                break;
            case "worker":
                const worker = new Worker(unitParam, null);
                this.#units.set(worker.getId(), worker);
                break;
            case "warrior":
                const warrior = new Warrior(unitParam, null);
                this.#units.set(warrior.getId(), warrior);
                break;
            default:
                console.log("unkown unit", unitData, unitData.unitType);
                break;
        }
    }
}

export default UnitManager;
