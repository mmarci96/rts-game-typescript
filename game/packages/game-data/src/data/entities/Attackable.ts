import { IAttackable } from "../types";

class Attackable implements IAttackable {
    #health: number;
    #maxHealth: number;

    constructor(health: number) {
        this.#health = health;
        this.#maxHealth = health;
    }

    getMaxHealth() {
        return this.#maxHealth;
    }

    takeDamage(damage: number) {
        this.#health = Math.max(0, this.#health - damage);
    }

    getHealth() {
        return this.#health;
    }
}

export default Attackable;
