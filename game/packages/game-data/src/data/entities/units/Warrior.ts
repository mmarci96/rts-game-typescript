import Unit from "./Unit";
import { UnitParams } from "../../types";
import { AStar } from "../../utils/pathfinding";
import { Command } from "../../commands/Command";

class Warrior extends Unit {
    constructor(parameters: UnitParams, aStar: AStar | null) {
        super(parameters, aStar);
    }

    handleCommand(command: Command): void {
        console.log(command.commandType);
    }

    getType(): string {
        return "warrior";
    }
}

export default Warrior;
