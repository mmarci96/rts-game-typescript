import ControlledEntity from "../ControlledEntity";
import { UnitParams, Target } from "../../types";
import Attackable from "../Attackable";
import Movable from "../Movable";

class Unit extends ControlledEntity {
    attackable;
    #damage;
    #speed;
    #target;
    movable: Movable;

    constructor(parameters: UnitParams) {
        super(parameters.controlledParams);
        this.attackable = new Attackable(parameters.health);
        this.#damage = parameters.damage;
        this.#speed = parameters.speed;
        this.#target = parameters.target;
        this.movable = new Movable(this.#speed);
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

    getDamage() {
        return this.#damage;
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
