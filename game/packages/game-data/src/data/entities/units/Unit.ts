import { Tile, UnitParams, UnitUpdateData } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";
import { IAttacker, IMovable } from "../../types";
import { AStar } from "../../utils/pathfinding";

abstract class Unit extends Attackable implements IAttacker, IMovable {
    public idleTime: number = 0;
    private movable: Movable;
    private attacker: Attacker;
    private onAttackMove: boolean = false;

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
            case "attack_move":
                this.updateAttackMove(deltaTime);
                break;
            case "idle":
                this.idleTime += deltaTime;
                break;
            default:
                break;
        }
    }

    updateAttackMove(deltaTime: number) {
        console.log("AttackMoving: ", this);
        const { newX, newY, progress } = this.move(deltaTime);
        if (progress === "completed") {
            this.movable.setTarget(null, null);
            if (!this.attacker.getAttackableTarget()) {
                this.setStatus("idle");
                this.onAttackMove = false;
            }
        } else {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            this.setStatus("attack_move");
        }
        if (this.attacker.getAttackableTarget()) {
            this.attackHandler();
        }
    }

    handleAttackMoveCommand(
        destination: { x: number; y: number } | null,
        victim: Attackable | null,
    ) {
        this.onAttackMove = true;
        this.setStatus("attack_move");
        this.setAttackableTarget(victim);
        if (!victim && destination) {
            const { x, y } = destination;
            this.setupPathfinder(x, y);
        }
    }

    handleMoveCommand(destination: { x: number; y: number }): void {
        this.setStatus("moving");
        this.onAttackMove = false;
        this.setAttackableTarget(null);
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

    protected attackHandler() {
        const targetUnit = this.getAttackableTarget();
        if (!targetUnit || targetUnit.getHealth() <= 0) {
            this.setStatus("idle");
            this.setAttackableTarget(null);
            return;
        }
        const tx = targetUnit.getX();
        const ty = targetUnit.getY();
        const targetLocation = this.movable.getTarget();
        if (!this.hasPath()) {
            this.movable.setupPathfinder(tx, ty);
        } else if (targetLocation.targetY && targetLocation.targetX) {
            const diffX = Math.abs(tx - targetLocation.targetX);
            const diffY = Math.abs(ty - targetLocation.targetY);
            if (diffX >= 1 || diffY >= 1) {
                this.movable.setupPathfinder(tx, ty);
            }
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
        } else if (this.onAttackMove) {
            this.setStatus("attack_move");
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

    protected updateCooldown(deltaTime: number) {
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
