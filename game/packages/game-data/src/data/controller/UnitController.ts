import { UnitData, UnitType, UnitUpdateData, PlayerColor } from "../types";
import { mapUnitToUnitParams } from "../utils";
import { Unit, Archer, Worker, Warrior } from "../entities";

class UnitController {
    #units;
    constructor() {
        this.#units = new Map<string, Unit>();
    }

    refreshUnits(deltaTime: number) {
        [...this.#units.values()].forEach((unit: Unit) => {
            if (unit.attackable.getHealth() <= 0) {
                this.#units.delete(unit.getId());
                return;
            }
            let state = unit.getStatus();
            switch (state) {
                case "attack":
                    this.handleAttack(unit);
                    break;
                case "moving":
                    unit.updatePosition(deltaTime);
                    break;
                case "cooldown":
                    unit.attacker.updateCooldown(deltaTime);
                    break;
                case "idle":
                    this.adjustIdleUnitPosition(unit);
                    break;
                default:
                    break;
            }
        });
    }

    adjustIdleUnitPosition(idleUnit: Unit) {
        const unitsArray = [...this.#units.values()];
        const bufferDistance = 1.6;

        unitsArray.forEach((otherUnit) => {
            if (idleUnit === otherUnit || otherUnit.getStatus() !== "idle")
                return;

            const dx = otherUnit.getX() - idleUnit.getX();
            const dy = otherUnit.getY() - idleUnit.getY();
            const distance = Math.sqrt(dx ** 2 + dy ** 2);

            if (distance < bufferDistance) {
                const overlap = bufferDistance - distance;

                const directionX = dx / distance || Math.random() - 0.5;
                const directionY = dy / distance || Math.random() - 0.5;

                idleUnit.setX(idleUnit.getX() - directionX * overlap);
                idleUnit.setY(idleUnit.getY() - directionY * overlap);
            }
        });
    }

    handleAttack(unit: Unit) {
        const targetId = unit.attacker.getTargetId();
        if (!targetId) {
            unit.setStatus("idle");
            return;
        }
        const targetUnit = this.getUnitById(targetId);
        if (!targetUnit) {
            unit.setStatus("idle");
            unit.attacker.resetTarget();
            return;
        }
        const tx = targetUnit.getX();
        const ty = targetUnit.getY();
        const dx = tx - unit.getX();
        const dy = ty - unit.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attackRange = 1.2;
        if (distance <= attackRange) {
            const status = unit.attacker.attackUnit(targetUnit);
            unit.movable.setTarget(unit.getX(), unit.getY());
            unit.setStatus(status);
        } else {
            const directionX = dx / distance;
            const directionY = dy / distance;
            const targetX = tx - directionX * (attackRange - 0.1);
            const targetY = ty - directionY * (attackRange - 0.1);
            unit.movable.setTarget(targetX, targetY);
            unit.setStatus("moving");
        }
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
        unit.setStatus(unitUpdateData.state);
        unit.movable.setTarget(
            unitUpdateData.target.x,
            unitUpdateData.target.y,
        );
        //unit.attackable.setHealth(unitUpdateData.health);
        const targetId = unitUpdateData.target.id?.toString();
        if (targetId) {
            unit.attacker.setTargetId(targetId);
        }
    }

    checkForOverlaps() {
        const unitsArray = [...this.#units.values()];
        const minDistance = 1.2;

        for (let i = 0; i < unitsArray.length; i++) {
            const unitA = unitsArray[i];

            for (let j = i + 1; j < unitsArray.length; j++) {
                const unitB = unitsArray[j];

                const dx = unitB.getX() - unitA.getX();
                const dy = unitB.getY() - unitA.getY();
                const distance = Math.sqrt(dx ** 2 + dy ** 2);

                if (distance < minDistance) {
                    const angleA = Math.random() * Math.PI * 2;
                    const angleB = Math.random() * Math.PI * 2;

                    unitA.movable.setTarget(
                        unitA.getX() + Math.cos(angleA) * minDistance,
                        unitA.getY() + Math.sin(angleA) * minDistance,
                    );
                    unitB.movable.setTarget(
                        unitB.getX() + Math.cos(angleB) * minDistance,
                        unitB.getY() + Math.sin(angleB) * minDistance,
                    );
                }
            }
        }
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
