import { Tile, UnitParams, UnitUpdateData } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";
import { IAttacker, IMovable } from "../../types";
import { AStar } from "../../utils/pathfinding";
import { MoveCommand } from "../../commands";

abstract class Unit extends Attackable implements IAttacker, IMovable {
    public idleTime: number = 0;
    private movable: Movable;
    private attacker: Attacker;

    constructor(parameters: UnitParams, aStar: AStar | null) {
        super(parameters.controlledParams);
        this.movable = new Movable(
            parameters.speed,
            this.getX(),
            this.getY(),
            aStar,
        );
        this.attacker = new Attacker(
            parameters.damage,
            parameters.attackSpeed,
            parameters.attackRange,
        );
        this.movable.setTarget(parameters.target.x, parameters.target.y);
    }

    handleMoveCommand(destination: { x: number; y: number }): void {
        this.movable.handleMoveCommand(destination);
    }

    handleUpdateData(data: UnitUpdateData) {
        if (data.position.y !== null || data.position.x !== null) {
            this.setTarget(data.position.x, data.position.y);
        }
        if (this.getHealth() !== data.health) {
            this.setHealth(data.health);
        }
        if (this.getStatus() !== data.state) {
            this.setStatus(data.state);
        }
    }

    update(deltaTime: number) {
        let state = this.getStatus();
        if (state !== "idle") this.idleTime = 0;
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

    private attackHandler() {
        const targetUnit = this.getAttackableTarget();
        if (!targetUnit || targetUnit.getHealth() <= 0) {
            this.setStatus("idle");
            this.setAttackableTarget(null);
            return;
        }
        const tx = targetUnit.getX();
        const ty = targetUnit.getY();
        if (!this.hasPath()) {
            this.setupPathfinder(tx, tx);
        }
        const dx = tx - this.getX();
        const dy = ty - this.getY();
        const distance = Math.sqrt(dx * dx + dy * dy);
        const attackRange = Number(this.getAttackRange());
        const attackBuffer = 0.4;
        const attackRangeWithBuffer = attackRange + attackBuffer;
        const epsilon = 0.000001;

        if (distance <= attackRangeWithBuffer + epsilon) {
            const status = this.attack();
            this.setStatus(status);
        } else {
            this.setStatus("moving");
        }
    }

    move(deltaTime: number) {
        return this.movable.move(deltaTime);
    }

    private hasPath() {
        return this.movable.hasPath();
    }

    protected updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.move(deltaTime);
        if (progress === "completed") {
            this.movable.setTarget(null, null);
            if (!this.attacker.getAttackableTarget()) {
                this.setStatus("idle");
            }
        } else {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            this.setStatus("moving");
        }
        if (this.attacker.getAttackableTarget()) {
            this.attackHandler();
        }
    }

    mining(deltaTime: number) {
        if (deltaTime) {
            this.setStatus("idle");
        }
    }

    private updateCooldown(deltaTime: number) {
        if (this.canAttack()) {
            this.attackHandler();
            return;
        }
        this.attacker.updateCooldown(deltaTime);
    }

    protected setupPathfinder(targetX: number, targetY: number): Tile[] {
        return this.movable.setupPathfinder(targetX, targetY);
    }

    getAttackableTarget(): Attackable | null {
        return this.attacker.getAttackableTarget();
    }

    setAttackableTarget(target: Attackable | null): void {
        this.attacker.setAttackableTarget(target);
    }

    getAttackSpeed(): number {
        return this.attacker.getAttackSpeed();
    }

    getAttackDamage(): number {
        return this.attacker.getAttackDamage();
    }

    attack(): string {
        return this.attacker.attack();
    }

    resetTarget(): void {
        this.attacker.resetTarget();
    }

    getTarget(): { targetX: number | null; targetY: number | null } {
        return this.movable.getTarget();
    }

    getAttackRange(): number {
        return this.attacker.getAttackRange();
    }

    setTarget(x: number | null, y: number | null): void {
        this.movable.setTarget(x, y);
    }

    canAttack(): boolean {
        return this.attacker.canAttack();
    }

    getSpeed() {
        return this.movable.getSpeed();
    }

    getType() {
        return "unit";
    }
}

export default Unit;
