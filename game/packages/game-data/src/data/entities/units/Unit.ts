import ControlledEntity from "../ControlledEntity";
import { UnitParams, Target } from "../../types";
import Attackable from "../Attackable";

class Unit extends ControlledEntity {
    attackable;
    #damage;
    #speed;
    #target;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health);
        this.#damage = parameters.damage;
        this.#speed = parameters.speed;
        this.#target = parameters.target;
    }

    getDamage() {
        return this.#damage;
    }

    getSpeed() {
        return this.#speed;
    }

    getTarget(): Target {
        return this.#target;
    }
    setTarget(target: Target) {
        this.#target = target;
    }

    getType() {
        return "unit";
    }
}

export default Unit;
