import { ControlledEntityParams } from "../types";
import GameEntity from "./GameEntity";

abstract class ControlledEntity extends GameEntity {
    private color;
    private status;

    constructor(params: ControlledEntityParams) {
        const { id, position, description, color, status, size } = params;
        super(id, position, description, size);
        this.color = color;
        this.status = status;
    }

    getColor() {
        return this.color;
    }

    getStatus() {
        return this.status;
    }

    setStatus(status: string) {
        this.status = status;
    }
}

export default ControlledEntity;
