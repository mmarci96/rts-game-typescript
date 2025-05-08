import { Command } from "../types";

class AttackCommand implements Command {
    readonly commandType: string = "attack";
    constructor(
        public readonly timestamp: Date,
        public readonly targetEntityId: string,
        public readonly atttackTargetId: string,
    ) {}
}

export default AttackCommand;
