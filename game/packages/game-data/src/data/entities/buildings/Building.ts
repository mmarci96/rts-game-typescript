import { BuildingParams, IAttackable } from "../../types";
import Attackable from "../Attackable";
import ControlledEntity from "../ControlledEntity";

class Building extends ControlledEntity implements IAttackable {
    #attackable;

    constructor(parameters: BuildingParams) {
        super(parameters.controlledParams);
        this.#attackable = new Attackable(parameters.health);
    }
    getHealth(): number {
        return this.#attackable.getHealth();
    }
    getMaxHealth(): number {
        return this.#attackable.getMaxHealth();
    }
    takeDamage(damage: number): void {
        this.#attackable.takeDamage(damage)
    }
    getActions(): string[] {
        return [];
    }
    getType(): string {
        return "building";
    }
}

export default Building;
