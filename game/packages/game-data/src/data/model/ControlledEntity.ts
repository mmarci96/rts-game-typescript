import { PlayerColor, Position } from "../types";
import GameEntity from "./GameEntity";

interface ControlledEntityParams {
    id: string;
    position: Position;
    description?: string;
    color: PlayerColor;
    status: string;
}

class ControlledEntity extends GameEntity {
    #color
    #status

    constructor(params: ControlledEntityParams) {
        const { id, position, description, color, status } = params;
        super(id, position, description);
        this.#color = color;
        this.#status = status;
    }

    /**
    * @returns PlayerColor
    */
    getColor() {
        return this.#color;
    }

    /**
    * @returns string
    */
    getStatus() {
        return this.#status;
    }

    /**
    * @param status string
    */
    setStatus(status: string) {
        this.#status = status;
    }
}

export default ControlledEntity;
