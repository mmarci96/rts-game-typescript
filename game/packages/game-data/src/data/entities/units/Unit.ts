import ControlledEntity from "../ControlledEntity";
import { UnitParams, Target } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";
import Attacker from "../Attacker";

class Unit extends ControlledEntity {
    attackable;
    #speed;
    #target;
    idleTime: number = 0;
    movable: Movable;
    attacker: Attacker;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health);
        this.#speed = parameters.speed;
        this.#target = parameters.target;
        this.movable = new Movable(this.#speed);
        this.attacker = new Attacker(parameters.damage, parameters.attackSpeed);
    }

    updatePosition(deltaTime: number) {
        const { newX, newY, progress } = this.movable.move(
            this.getX(),
            this.getY(),
            deltaTime,
        );

        if (progress !== "completed") {
            this.setX(newX);
            this.setY(newY);
            this.setStatus("moving");
            return;
        }

        if (this.#target.id !== null) {
            this.setStatus("attack");
            return;
        }

        this.setStatus("idle");
        return;
    }

    getSpeed() {
        return this.#speed;
    }

    getTarget(): Target {
        return this.#target;
    }
    setTarget(target: Target) {
        this.#target = target;
    }

    getType() {
        return "unit";
    }
}

export default Unit;
