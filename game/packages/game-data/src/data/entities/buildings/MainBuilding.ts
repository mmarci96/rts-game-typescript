import { ActionProvider, BuildingParams } from "../../types";
import Building from "./Building";

class MainBuilding extends Building implements ActionProvider {
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

    getAvailableActions() {
        const actions = new Set<string>();
        actions.add("create_warrior")
        actions.add("create_worker")
        actions.add("create_archer")
        return actions;
    }

    updateTraining(deltaTime: number) {
        this.#currentTimer = this.#currentTimer - deltaTime;
        if (this.#currentTimer <= 0) {
            this.#currentTimer = 0;
        }
    }
    getType(): string {
        return "main";
    }
}

export default MainBuilding;
