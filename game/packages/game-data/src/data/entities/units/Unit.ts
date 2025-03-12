import ControlledEntity from "../ControlledEntity";
import { UnitParams } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";

class Unit extends ControlledEntity {
    attackable;
    #speed;
    idleTime: number = 0;
    movable: Movable;
    attacker: Attacker;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health);
        this.#speed = parameters.speed;
        this.movable = new Movable(this.#speed);
        this.movable.setTarget(parameters.target.x, parameters.target.y);
        this.attacker = new Attacker(parameters.damage, parameters.attackSpeed, parameters.attackRange);
        if (parameters.target.id) {
            this.attacker.setTargetId(parameters.target.id);
        }
    }
    update(deltaTime: number) {

    }
    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.movable.move(
            this.getX(),
            this.getY(),
            deltaTime,
        );
        if (progress === "completed") {
            this.movable.setTarget(null, null);
        }

        if (progress !== "completed") {
            this.idleTime = 0;
            this.setX(newX);
            this.setY(newY);
            this.setStatus("moving");
            return;
        }

        if (this.attacker.getTargetId() !== null) {
            this.idleTime = 0;
            this.setStatus("attack");
            return;
        }

        this.setStatus("idle");
        return;
    }

    getSpeed() {
        return this.#speed;
    }

    getType() {
        return "unit";
    }
}

export default Unit;
