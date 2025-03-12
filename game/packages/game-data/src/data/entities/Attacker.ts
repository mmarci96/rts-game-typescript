import { Unit } from "./units";

class Attacker {
    #attackDamage: number;
    #targetId: string | null;
    #attackSpeed: number;
    #attackRange: number;
    #coolDown: number;

    constructor(
        attackDamage: number,
        attackSpeed: number,
        attackRange: number,
    ) {
        this.#attackDamage = attackDamage;
        this.#attackSpeed = attackSpeed;
        this.#attackRange = attackRange;
        this.#coolDown = 0;
        this.#targetId = null;
    }

    getAttackRange() {
        return this.#attackRange;
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
        this.#coolDown = Math.max(0, this.#coolDown - deltaTime);
    }

    attackUnit(targetUnit: Unit) {
        if (this.canAttack()) {
            this.startCoolDown();
            const damage = this.getAttackDamage();
            targetUnit.attackable.getAttacked(damage);
            return "attack";
        }
        return "cooldown";
    }

    canAttack() {
        return this.#coolDown <= 0;
    }
}
export default Attacker;
