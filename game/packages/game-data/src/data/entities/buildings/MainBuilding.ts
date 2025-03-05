import { BuildingParams } from "../../types";
import { Unit } from "../units";
import Building from "./Building";

class MainBuilding extends Building {
    #currentTimer: number = 0;
    #trainingUnit: Unit | null = null;
    #addUnitCallback: (unit: Unit) => void = (unit: Unit) => { };
    constructor(parameters: BuildingParams) {
        super(parameters);
    }

    createUnit(unitType: string, addUnitCallback: (unit: Unit) => void) {
        this.#addUnitCallback = addUnitCallback;
        let trainingDuration = 4;
        if (unitType === 'warrior') {
            trainingDuration++
        }
        if (unitType === 'archer') {
            trainingDuration += 2;
        }
        this.#currentTimer = trainingDuration;
        const spawnX = this.getX() + 2;
        const spawnY = this.getY() + 2;
        const color = this.getColor();
        return { spawnX, spawnY, unitType, color };
    }

    trainUnit(unit: Unit) {
        this.#trainingUnit = unit;
    }

    getActions(): string[] {
        const actions = ["create_warrior", "create_worker", "create_archer"];
        return actions;
    }

    updateTraining(deltaTime: number) {
        if (this.#trainingUnit) {
            if (this.#currentTimer <= 0) {
                this.#addUnitCallback(this.#trainingUnit);
                this.#currentTimer = 0;
                this.#trainingUnit = null;
            } else {
                this.#currentTimer = this.#currentTimer - deltaTime;
            }
        }
    }
}

export default MainBuilding;
