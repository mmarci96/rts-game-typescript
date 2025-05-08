import { Command } from "../types";

class AttackMoveCommand implements Command {
    readonly commandType: string = "attack_move";
    constructor(
        public readonly timestamp: Date,
        public readonly targetEntityId: string,
        public readonly atttackTargetId: string | null,
        public readonly destination: string | null,
    ) {}
}

export default AttackMoveCommand;
