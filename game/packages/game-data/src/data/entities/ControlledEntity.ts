import { ControlledEntityParams } from "../types";
import GameEntity from "./GameEntity";

class ControlledEntity extends GameEntity {
    private color
    private status

    constructor(params: ControlledEntityParams) {
        const { id, position, description, color, status, size } = params;
        super(id, position, description, size);
        this.color = color;
        this.status = status;
    }

    /**
    * @returns PlayerColor
    */
    getColor() {
        return this.color;
    }

    /**
    * @returns string
    */
    getStatus() {
        return this.status;
    }

    /**
    * @param status string
    */
    setStatus(status: string) {
        this.status = status;
    }
}

export default ControlledEntity;
