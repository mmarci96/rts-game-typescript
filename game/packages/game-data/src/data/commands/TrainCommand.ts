import { Command } from "../types";

class TrainCommand implements Command {
    readonly commandType: string = "train";
    constructor(
        public readonly timestamp: Date,
        public readonly targetEntityId: string,
        public readonly unitType: string,
    ) {}
}

export default TrainCommand;
