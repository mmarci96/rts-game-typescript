import { Position } from "../types";
import GameEntity from "./GameEntity";

class Neutral extends GameEntity {
    constructor(id: string, position: Position, description: string) {
        super(id, position, description)
    }
}

export default Neutral;
