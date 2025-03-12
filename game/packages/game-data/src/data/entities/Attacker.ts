import { Unit } from "./units";

class Attacker {
    #attackDamage: number;
    #targetId: string | null;
    #attackSpeed: number;
    #coolDown: number;

    constructor(attackDamage: number, attackSpeed: number) {
        this.#attackDamage = attackDamage;
        this.#attackSpeed = attackSpeed;
        this.#coolDown = 0;
        this.#targetId = null;
    }
    getAttackSpeed() {
        return this.#attackSpeed;
    }

    getAttackDamage() {
        return this.#attackDamage;
    }

    setTargetId(targetId: string | null) {
        this.#targetId = targetId;
    }

    resetTarget() {
        this.#targetId = null;
    }

    getTargetId() {
        return this.#targetId;
    }

    startCoolDown() {
        this.#coolDown = 1 / this.#attackSpeed;
    }

    updateCooldown(deltaTime: number) {
        if (this.#coolDown <= 0) {
            this.#coolDown = 0;
        } else {
            this.#coolDown -= deltaTime;
        }
    }

    attackUnit(targetUnit: Unit) {
        if (this.canAttack()) {
            this.startCoolDown();
            return "attack";
        }

        const damage = this.getAttackDamage();
        targetUnit.attackable.getAttacked(damage);
        return "cooldown";
    }
    canAttack() {
        return this.#coolDown <= 0;
    }
}

export default Attacker;
