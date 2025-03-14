import { UnitParams } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";
import { IAttackable, IAttacker, IMovable } from "../../types";

class Unit extends Attackable implements IAttacker, IMovable {
    idleTime: number = 0;
    #movable: Movable;
    #attacker: Attacker;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.#movable = new Movable(parameters.speed);
        this.#attacker = new Attacker(
            parameters.damage,
            parameters.attackSpeed,
            parameters.attackRange
        );
        this.#movable.setTarget(parameters.target.x, parameters.target.y);
    }

    getAttackableTarget(): IAttackable | null {
        return this.#attacker.getAttackableTarget()
    }
    setAttackableTarget(target: Attackable | null): void {
        this.#attacker.setAttackableTarget(target)
    }
    getAttackSpeed(): number {
        return this.#attacker.getAttackSpeed()
    }
    getAttackDamage(): number {
        return this.#attacker.getAttackDamage()
    }
    attack(): string {
        return this.#attacker.attack();
    }

    resetTarget(): void {
        this.setStatus("idle")
        this.#attacker.resetTarget();
    }
    getTarget(): { targetX: number | null; targetY: number | null; } {
        return this.#movable.getTarget();
    }

    getAttackRange(): number {
        return this.#attacker.getAttackRange();
    }

    move(startX: number, startY: number, deltaTime: number) {
        return this.#movable.move(startX, startY, deltaTime);
    }
    setTarget(x: number | null, y: number | null): void {
        this.#movable.setTarget(x, y);
    }
    canAttack(): boolean {
        return this.#attacker.canAttack()
    }
    updateCooldown(deltaTime: number) {
        if (this.#attacker.getCooldown() <= 0 && !this.#attacker.getAttackableTarget()) {
            this.setStatus("idle");
        }
        this.#attacker.updateCooldown(deltaTime)
    }

    update(deltaTime: number) {
        //this.#attacker.updateCooldown(deltaTime);
        //this.updatePosition(deltaTime);
    }
    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.move(
            this.getX(),
            this.getY(),
            deltaTime,
        );
        if (progress === "completed") {
            this.#movable.setTarget(null, null);
        }

        if (progress !== "completed") {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            this.setStatus("moving");
            return;
        }

        if (this.#attacker.getAttackableTarget()) {
            this.idleTime = 0;
            this.setStatus("attack");
            return;
        }

        this.setStatus("idle");
        return;
    }

    getSpeed() {
        return this.#movable.getSpeed();
    }

    getType() {
        return "unit";
    }
}

export default Unit;
