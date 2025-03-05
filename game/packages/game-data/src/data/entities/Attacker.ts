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
        this.#coolDown -= deltaTime;
        if (this.#coolDown < 0) {
            this.#coolDown = 0;
        }
    }

    attackUnit(targetUnit: Unit) {
        if (this.canAttack()) {
            this.startCoolDown();
            return "attack";
        }

        const damage = this.getAttackDamage();
        targetUnit.attackable.getAttacked(damage);
        if (targetUnit.attackable.getHealth() <= 0 || !targetUnit) {
            this.#targetId = null;
            return "idle";
        }

        return "cooldown";
    }
    canAttack() {
        return this.#coolDown <= 0;
    }
}

export default Attacker;
