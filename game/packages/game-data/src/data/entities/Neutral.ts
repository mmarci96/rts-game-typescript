import { Position, Size } from "../types";
import GameEntity from "./GameEntity";

class Neutral extends GameEntity {
    constructor(id: string, position: Position, description: string, size: Size) {
        super(id, position, description, size)
    }
}

export default Neutral;
