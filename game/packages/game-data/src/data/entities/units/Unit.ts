import { Tile, UnitParams } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";
import { IAttacker, IMovable } from "../../types";
import { AStar } from "../../utils/pathfinding";

class Unit extends Attackable implements IAttacker, IMovable {
    idleTime: number = 0;
    #movable: Movable;
    #attacker: Attacker;

    constructor(parameters: UnitParams, aStar: AStar | null) {
        super(parameters.controlledParams);
        this.#movable = new Movable(parameters.speed, this.getX(), this.getY(), aStar);
        this.#attacker = new Attacker(
            parameters.damage,
            parameters.attackSpeed,
            parameters.attackRange
        );
        this.#movable.setTarget(parameters.target.x, parameters.target.y);
    }

    update(deltaTime: number) {
        let state = this.getStatus();
        switch (state) {
            case "attack":
                this.attackHandler();
                break;
            case "moving":
                this.updatePosition(deltaTime);
                break;
            case "cooldown":
                this.updateCooldown(deltaTime);
                break;
            case "idle":
                this.idleTime += deltaTime;
                break;
            case "mining":
                this.mining(deltaTime);
                break;
            default:
                break;
        }
    }

    attackHandler() {
        const targetUnit = this.getAttackableTarget();
        if (!targetUnit || targetUnit.getHealth() <= 0) {
            this.setStatus("idle");
            this.setAttackableTarget(null);
            return;
        }
        const tx = targetUnit.getX();
        const ty = targetUnit.getY();
        const dx = tx - this.getX();
        const dy = ty - this.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attackRange = Number(this.getAttackRange());
        const buffer = 0.1;
        if (distance <= Number(attackRange + buffer)) {
            const status = this.attack();
            this.setStatus(status);
        } else {
            const dynamicOffset = Math.min(attackRange - buffer, distance - 0.2);
            const directionX = dx / distance;
            const directionY = dy / distance;

            const targetX = tx - directionX * dynamicOffset;
            const targetY = ty - directionY * dynamicOffset;

            this.setupPathfinder(this.getX(), this.getY(), targetX, targetY);
            this.setStatus("moving");
        }
    }

    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.#movable.move(deltaTime);
        if (progress === "completed") {
            this.#movable.setTarget(null, null);
            if (!this.#attacker.getAttackableTarget()) {
                this.setStatus("idle");
            }
            else if (this.#attacker.getAttackableTarget()) {
                this.setStatus("attack");
            }
        } else {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            if (this.getStatus() !== "moving") {
                this.setStatus("moving");
            }
        }
    }

    mining(deltaTime: number) {
        if (deltaTime) {
            this.setStatus("idle");
        }
    };

    updateCooldown(deltaTime: number) {
        if (this.canAttack()) {
            this.setStatus('attack');
            return;
        }
        this.#attacker.updateCooldown(deltaTime)
    }

    setupPathfinder(startX: number, startY: number, targetX: number, targetY: number): Tile[] {
        return this.#movable.setupPathfinder(startX, startY, targetX, targetY)
    }

    getAttackableTarget(): Attackable | null {
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
        this.#attacker.resetTarget();
    }

    getTarget(): { targetX: number | null; targetY: number | null; } {
        return this.#movable.getTarget();
    }

    getAttackRange(): number {
        return this.#attacker.getAttackRange();
    }

    setTarget(x: number | null, y: number | null): void {
        this.#movable.setTarget(x, y);
    }
    canAttack(): boolean {
        return this.#attacker.canAttack()
    }

    getSpeed() {
        return this.#movable.getSpeed();
    }

    getType() {
        return "unit";
    }
}

export default Unit;
