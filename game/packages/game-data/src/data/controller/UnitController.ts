import { UnitData, PlayerColor, PlayerResources } from "../types";
import { mapUnitToUnitParams } from "../utils";
import { Unit, Archer, Worker, Warrior } from "../entities";
import Player from "../Player";
import GameMap from "../GameMap";
import { AStar } from "../utils/pathfinding";

class UnitController {
    private units;
    private gameMap;
    private aStar;

    constructor(gameMap: GameMap) {
        this.units = new Map<string, Unit>();
        this.gameMap = gameMap;
        this.aStar = new AStar(this.gameMap.getTiles());
    }

    refreshUnits(deltaTime: number) {
        [...this.units.values()].forEach((unit: Unit) => {
            if (unit.getHealth() <= 0) {
                this.units.delete(unit.getId());
                return;
            }
            unit.update(deltaTime);
            if (unit.idleTime >= 1 && unit.idleTime < 2) {
                this.adjustIdleUnitPosition(unit);
            }
        });
    }

    groupUnitsByColor(): Record<PlayerColor, Unit[]> {
        const colorGroups = {
            [PlayerColor.RED]: [] as Unit[],
            [PlayerColor.BLUE]: [] as Unit[],
            [PlayerColor.PURPLE]: [] as Unit[],
            [PlayerColor.YELLOW]: [] as Unit[],
        };

        for (const unit of this.units.values()) {
            const color = unit.getColor();
            colorGroups[color].push(unit);
        }

        return colorGroups;
    }

    getMinedResources(player: Player): PlayerResources {
        let wood = 0;
        let food = 0;
        const workers: Worker[] = [...this.units.values()].filter(
            (worker: Unit) =>
                worker instanceof Worker &&
                worker.getColor() === player.getColor(),
        ) as Worker[];

        workers.forEach((worker) => {
            const resType = worker.getTargetResource()?.getType();
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

    private adjustIdleUnitPosition(idleUnit: Unit) {
        const unitsArray = [...this.units.values()];
        const bufferDistance = 1.4;

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

                const targetX = idleUnit.getX() - directionX * overlap;
                const targetY = idleUnit.getY() - directionY * overlap;
                idleUnit.setPosition({ x: targetX, y: targetY });
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
        return [...this.units.keys()];
    }

    getEnemyUnits(allyColor: PlayerColor) {
        return this.getUnits().filter(
            (unit: Unit) => unit.getColor() !== allyColor,
        );
    }

    addUnit(unit: Unit) {
        this.units.set(unit.getId(), unit);
    }

    removeUnit(unitId: string) {
        this.units.delete(unitId);
    }

    getUnits() {
        return [...this.units.values()];
    }

    getUnitById(id: string): Unit | null {
        const unit = this.units.get(id);
        if (!unit) return null;
        return unit;
    }

    private updateUnitWithData(unit: Unit, unitData: UnitData) {
        unit.setStatus(unitData.state);
        unit.setPosition(unitData.position);
        unit.setTarget(unitData.target.x, unitData.target.y);
        unit.setHealth(unitData.health);
    }

    loadUnit(unitData: UnitData) {
        const existing = this.units.get(unitData.id);
        if (existing) {
            this.updateUnitWithData(existing, unitData);
            return;
        }
        const unitParam = mapUnitToUnitParams(unitData);
        switch (unitData.unitType) {
            case "archer":
                const archer = new Archer(unitParam, this.aStar);
                this.units.set(archer.getId(), archer);
                break;
            case "worker":
                const worker = new Worker(unitParam, this.aStar);
                this.units.set(worker.getId(), worker);
                break;
            case "warrior":
                const warrior = new Warrior(unitParam, this.aStar);
                this.units.set(warrior.getId(), warrior);
                break;
            default:
                console.log("unkown unit", unitData, unitData.unitType);
                break;
        }
    }
}

export default UnitController;
