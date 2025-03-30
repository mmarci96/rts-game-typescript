import { IAttacker } from "../types";
import Attackable from "./Attackable";

class Attacker implements IAttacker {
    private attackDamage: number;
    private attackSpeed: number;
    private attackRange: number;
    private coolDown: number;
    private attackableTarget: Attackable | null = null;

    constructor(attackDamage: number, attackSpeed: number, attackRange: number) {
        this.attackDamage = attackDamage;
        this.attackSpeed = attackSpeed;
        this.attackRange = attackRange;
        this.coolDown = 0;
    }

    attack() {
        if (!this.attackableTarget) {
            return "idle";
        }
        if (this.canAttack()) {
            this.startCoolDown();
            this.attackableTarget.takeDamage(this.attackDamage);
            return "attack";
        }
        return "cooldown";
    }

    setAttackableTarget(attackable: Attackable | null) {
        this.attackableTarget = attackable;
    }

    getAttackableTarget() {
        return this.attackableTarget;
    }

    getAttackRange() {
        return this.attackRange;
    }

    getAttackSpeed() {
        return this.attackSpeed;
    }

    getAttackDamage() {
        return this.attackDamage;
    }

    resetTarget() {
        this.attackableTarget = null;
    }

    startCoolDown() {
        this.coolDown = 1 / this.attackSpeed;
    }

    updateCooldown(deltaTime: number) {
        this.coolDown = Math.max(0, this.coolDown - deltaTime);
    }

    getCooldown() {
        return this.coolDown;
    }

    canAttack() {
        return this.coolDown <= 0;
    }
}
export default Attacker;
