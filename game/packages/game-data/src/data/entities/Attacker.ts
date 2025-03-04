import Attackable from "./Attackable";

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

    setTargetId(targetId: string) {
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

    attackUnit(targetUnit: Attackable) {
        if (!this.canAttack()) {
            console.error("Unit should not attack on cooldown");
            return "cooldown";
        }

        const damage = this.getAttackDamage();
        targetUnit.getAttacked(damage);
        if (targetUnit.getHealth() <= 0) {
            this.#targetId = null;
            return "idle";
        }

        this.startCoolDown();
        return "cooldown";
    }
    canAttack() {
        return this.#coolDown <= 0;
    }
}

export default Attacker;
