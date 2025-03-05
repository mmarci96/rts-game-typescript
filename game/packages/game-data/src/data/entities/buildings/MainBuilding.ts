import { BuildingParams } from "../../types";
import Building from "./Building";

class MainBuilding extends Building {
    #currentTimer: number = 0;
    constructor(parameters: BuildingParams) {
        super(parameters);
    }

    createUnit(unitType: string) {
        let trainingDuration = 4;
        if (unitType === "warrior") {
            trainingDuration++;
        }
        if (unitType === "archer") {
            trainingDuration += 2;
        }
        this.#currentTimer = trainingDuration;
        const spawnX = this.getX() + 8;
        const spawnY = this.getY() + 8;
        const color = this.getColor();
        return { spawnX, spawnY, unitType, color };
    }

    getActions(): string[] {
        const actions = ["create_warrior", "create_worker", "create_archer"];
        return actions;
    }

    updateTraining(deltaTime: number) {
        this.#currentTimer = this.#currentTimer - deltaTime;
        if (this.#currentTimer <= 0) {
            this.#currentTimer = 0;
        }
    }
}

export default MainBuilding;
