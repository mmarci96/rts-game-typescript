import ControlledEntity from "../ControlledEntity";
import { UnitParams } from "../../types";
import Attackable from "../Attackable";

class Unit extends ControlledEntity {
    attackable
    #damage;
    #speed;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health);
        this.#damage = parameters.damage;
        this.#speed = parameters.speed;
    }

    getDamage() {
        return this.#damage;
    }

    getSpeed() {
        return this.#speed;
    }

    getType() {
        return ''
    }
}

export default Unit;
