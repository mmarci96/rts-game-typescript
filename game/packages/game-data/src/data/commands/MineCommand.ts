import { Command } from "../types";

class MineCommand implements Command {
    readonly commandType: string = "mine";
    constructor(
        public readonly timestamp: Date,
        public readonly targetEntityId: string,
        public readonly resourceTargetId: string,
    ) {}
}

export default MineCommand;
