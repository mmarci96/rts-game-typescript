import { AttackableParams, IAttackable } from "../types";
import ControlledEntity from "./ControlledEntity";

class Attackable extends ControlledEntity implements IAttackable {
    #health: number;
    #maxHealth: number;

    constructor(params: AttackableParams) {
        super(params.controlledParams);
        this.#health = params.health;
        this.#maxHealth = params.health;
    }

    getMaxHealth() {
        return this.#maxHealth;
    }

    takeDamage(damage: number) {
        this.#health = Math.max(0, this.#health - damage);
    }

    setHealth(hp: number) {
        this.#health = hp;
    }

    getHealth() {
        return this.#health;
    }
}

export default Attackable;
