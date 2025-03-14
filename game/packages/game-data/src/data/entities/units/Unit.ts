import ControlledEntity from "../ControlledEntity";
import { UnitParams } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";
import { IAttackable, IAttacker, IMovable } from "../../types";

class Unit extends ControlledEntity implements IAttackable, IAttacker, IMovable {
    #attackable;
    idleTime: number = 0;
    #movable: Movable;
    #attacker: Attacker;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.#attackable = new Attackable(parameters.health);
        this.#movable = new Movable(parameters.speed);
        this.#attacker = new Attacker(
            parameters.damage,
            parameters.attackSpeed,
            parameters.attackRange
        );
        this.#movable.setTarget(parameters.target.x, parameters.target.y);
        if (parameters.target.id) {
            this.#attacker.setTargetId(parameters.target.id);
        }
    }

    getHealth(): number {
        return this.#attackable.getHealth()
    }
    getMaxHealth(): number {
        return this.#attackable.getMaxHealth();
    }
    takeDamage(damage: number): void {
        this.#attackable.takeDamage(damage);
    }
    setHealth(health: number) {
        this.#attackable.setHealth(health);
    }
    attack(target: IAttackable): string {
        return this.#attacker.attack(target);
    }
    setTargetId(targetId: string | null): void {
        this.#attacker.setTargetId(targetId);
    }
    getTargetId(): string | null {
        return this.#attacker.getTargetId();
    }

    resetTarget(): void {
        this.#attacker.resetTarget();
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

    update(deltaTime: number) {
        this.#attacker.updateCooldown(deltaTime);
        this.updatePosition(deltaTime);
    }
    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.#movable.move(
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

        if (this.#attacker.getTargetId() !== null) {
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
