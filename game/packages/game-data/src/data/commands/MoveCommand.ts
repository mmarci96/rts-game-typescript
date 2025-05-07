import { Command } from "../types";

class MoveCommand implements Command {
    readonly commandType: string = "move";
    constructor(
        public readonly timestamp: Date,
        public readonly targetEntityId: string,
        public readonly destination: { x: number; y: number },
    ) {}
}

export default MoveCommand;
