import {
    UnitData,
    PlayerColor,
    PlayerResources,
    Tile,
} from "../types";
import { mapUnitToUnitParams } from "../utils";
import { Unit, Archer, Worker, Warrior } from "../entities";
import Player from "../Player";
import GameMap from "../GameMap";

class UnitController {
    #units;
    #gameMap;
    constructor(gameMap: GameMap) {
        this.#units = new Map<string, Unit>();
        this.#gameMap = gameMap
    }

    refreshUnits(deltaTime: number) {
        [...this.#units.values()].forEach((unit: Unit) => {
            if (unit.getHealth() <= 0) {
                this.#units.delete(unit.getId());
                return;
            }
            const x = Math.round(unit.getX())
            const y = Math.round(unit.getY())
            const tileName: Tile = this.#gameMap.getTiles()[y][x];
            if (tileName.tile === "water1") {
                this.checkInWater(unit);
            }
            unit.update(deltaTime);
            if (unit.idleTime >= 1) {
                this.adjustIdleUnitPosition(unit);
            }
        });
        this.checkForOverlaps();
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


    checkInWater(unit: Unit) {
        const waterPushForce = 0.2;
        const unitX = Math.round(unit.getX());
        const unitY = Math.round(unit.getY());

        // Check surrounding tiles
        const directions = [
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 },  // Down
        ];

        let pushX = 0;
        let pushY = 0;

        directions.forEach(({ dx, dy }) => {
            const newX = unitX + dx;
            const newY = unitY + dy;

            // Ensure within map bounds
            if (newY >= 0 && newY < this.#gameMap.getTiles().length &&
                newX >= 0 && newX < this.#gameMap.getTiles()[0].length) {
                const tile = this.#gameMap.getTiles()[newY][newX];

                // If it's not water, move in that direction
                if (tile.tile !== "water1") {
                    pushX += dx;
                    pushY += dy;
                }
            }
        });

        // Normalize direction
        const magnitude = Math.sqrt(pushX ** 2 + pushY ** 2);
        if (magnitude > 0) {
            pushX = (pushX / magnitude) * waterPushForce;
            pushY = (pushY / magnitude) * waterPushForce;
        } else {
            // If no clear direction, push randomly
            pushX = (Math.random() - 0.5) * waterPushForce;
            pushY = (Math.random() - 0.5) * waterPushForce;
        }

        // Move the unit away from water
        unit.setStatus("moving");
        unit.setX(unit.getX() + pushX);
        unit.setY(unit.getY() + pushY);
        unit.setTarget(null, null);
    }

    checkForOverlaps() {
        const unitsArray = [...this.#units.values()];
        const minDistance = 0.4;

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
                    if (unitA.getStatus() !== 'idle' && unitB.getStatus() !== "idle") {
                        unitA.setX(unitA.getX() + Math.cos(angleA) * 0.2)
                        unitA.setY(unitA.getY() + Math.sin(angleA) * 0.2)
                        unitB.setX(unitB.getX() + Math.cos(angleB) * 0.2)
                        unitB.setY(unitB.getY() + Math.sin(angleB) * 0.2)
                        return;
                    }
                    if (unitA.getStatus() === "idle") {
                        unitA.setStatus("moving");
                        unitA.setTarget(
                            unitA.getX() + Math.cos(angleA) * minDistance,
                            unitA.getY() + Math.sin(angleA) * minDistance,
                        );
                    }

                    if (unitB.getStatus() === "idle") {
                        unitB.setStatus("moving")
                        unitB.setTarget(
                            unitB.getX() + Math.cos(angleB) * minDistance,
                            unitB.getY() + Math.sin(angleB) * minDistance,
                        );
                    }
                }
            }
        }
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
