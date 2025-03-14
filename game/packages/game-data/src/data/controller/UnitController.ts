import {
    UnitData,
    UnitUpdateData,
    PlayerColor,
    PlayerResources,
} from "../types";
import { mapUnitToUnitParams } from "../utils";
import { Unit, Archer, Worker, Warrior } from "../entities";
import Player from "../Player";

class UnitController {
    #units;
    #deleted
    constructor() {
        this.#units = new Map<string, Unit>();
        this.#deleted = new Set<string>();
    }

    refreshUnits(deltaTime: number) {
        [...this.#units.values()].forEach((unit: Unit) => {
            if (unit.getHealth() <= 0) {
                this.#deleted.add(unit.getId());
                this.#units.delete(unit.getId());
                return;
            }
            let state = unit.getStatus();
            switch (state) {
                case "attack":
                    this.handleAttack(unit);
                    break;
                case "moving":
                    unit.update(deltaTime);
                    break;
                case "cooldown":
                    unit.update(deltaTime);
                    break;
                case "idle":
                    this.adjustIdleUnitPosition(unit);
                    break;
                case "mining":
                    unit.update(deltaTime);
                    break;
                default:
                    break;
            }
        });
    }
    getDeletedUnits(): string[] {
        return [...this.#deleted.keys()]
    }
    flushDeletedUnits() {
        this.#deleted.clear();
    }
    checkWinner(): PlayerColor | undefined {
        const colorPresence = new Set<PlayerColor>();
        for (const unit of this.#units.values()) {
            if (unit.getHealth() > 0) {
                colorPresence.add(unit.getColor());
            }
        }

        if (colorPresence.size === 1) {
            return colorPresence.values().next().value;
        }

        return undefined;
    }
    groupUnitsByColor(): Record<PlayerColor, Unit[]> {
        const colorGroups = {
            [PlayerColor.RED]: [] as Unit[],
            [PlayerColor.BLUE]: [] as Unit[],
            [PlayerColor.PURPLE]: [] as Unit[],
            [PlayerColor.YELLOW]: [] as Unit[],
        };

        for (const unit of this.#units.values()) {
            const color = unit.getColor();
            colorGroups[color].push(unit);
        }

        return colorGroups;
    }
    getMinedResources(player: Player): PlayerResources {
        let wood = 0;
        let food = 0;
        const workers: Worker[] = [...this.#units.values()].filter(
            (worker: Unit) =>
                worker instanceof Worker &&
                worker.getColor() === player.getColor(),
        ) as Worker[];

        workers.forEach((worker) => {
            const resType = worker.collector.getTarget()?.getType();
            switch (resType) {
                case "tree":
                    wood += worker.collector.getCollected();
                    break;
                case "wheat":
                    food += worker.collector.getCollected();
                default:
                    break;
            }
        });
        return { wood, food };
    }

    adjustIdleUnitPosition(idleUnit: Unit) {
        const unitsArray = [...this.#units.values()];
        const bufferDistance = 1;

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
        const targetId = unit.getTargetId();
        if (!targetId) {
            unit.setStatus("idle");
            return;
        }
        const targetUnit = this.getUnitById(targetId);
        if (!targetUnit) {
            unit.setStatus("idle");
            unit.resetTarget();
            return;
        }
        const tx = targetUnit.getX();
        const ty = targetUnit.getY();
        const dx = tx - unit.getX();
        const dy = ty - unit.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attackRange = unit.getAttackRange();
        if (distance <= attackRange) {
            const status = unit.attack(targetUnit);
            unit.setStatus(status);
        } else {
            const directionX = dx / distance;
            const directionY = dy / distance;
            const targetX = tx - directionX * (attackRange - 0.2);
            const targetY = ty - directionY * (attackRange - 0.2);
            unit.setTarget(targetX, targetY);
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

    updateUnit(unitUpdateData: UnitUpdateData) {
        const unit = this.getUnitById(unitUpdateData.id);
        if (!unit) {
            return;
        }
        unit.setStatus(unitUpdateData.state);
        unit.setTarget(
            unitUpdateData.target.x,
            unitUpdateData.target.y,
        );
        unit.setHealth(unitUpdateData.health);
        const targetId = unitUpdateData.target.id?.toString();
        if (targetId) {
            unit.setTargetId(targetId);
        }
    }

    checkForOverlaps() {
        const unitsArray = [...this.#units.values()];
        const minDistance = 1;

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

                    unitA.setTarget(
                        unitA.getX() + Math.cos(angleA) * minDistance,
                        unitA.getY() + Math.sin(angleA) * minDistance,
                    );
                    unitB.setTarget(
                        unitB.getX() + Math.cos(angleB) * minDistance,
                        unitB.getY() + Math.sin(angleB) * minDistance,
                    );
                }
            }
        }
    }

    loadUnit(unitData: UnitData) {
        const unitParam = mapUnitToUnitParams(unitData);
        switch (unitData.unitType) {
            case "archer":
                const archer = new Archer(unitParam);
                this.#units.set(archer.getId(), archer);
                break;
            case "worker":
                const worker = new Worker(unitParam);
                this.#units.set(worker.getId(), worker);
                break;
            case "warrior":
                const warrior = new Warrior(unitParam);
                this.#units.set(warrior.getId(), warrior);
                break;
            default:
                console.log("unkown unit", unitData, unitData.unitType);
                break;
        }
    }
}

export default UnitController;
