import Game from "../Game";
import {
    AttackCommand,
    Command,
    GameEntity,
    MineCommand,
    MoveCommand,
    Player,
    TrainCommand,
    Unit,
} from "@packages/game-data/dist";

export class GameCommandService {
    handlePlayerCommands(
        game: Game,
        commands: Command[],
        player: Player,
    ): void {
        console.log("Game", game);
        console.log("Player", player);

        commands.forEach((command) => {
            const entity = game
                .getLogic()
                .getEntityById(command.targetEntityId);
            if (!entity) {
                console.error(
                    "No entity found with id: ",
                    command.targetEntityId,
                );
                return;
            }
            console.log("Entity found: ", entity);

            switch (command.commandType) {
                case "move":
                    const moveCommand = command as MoveCommand;
                    this.handleMoveCommand(moveCommand, entity);
                    console.log("Movecommand processed: ", moveCommand);
                    break;
                case "train":
                    const trainCommand = command as TrainCommand;
                    console.log("Traincommand processed: ", trainCommand);
                    break;
                case "attack":
                    const attackCommand = command as AttackCommand;
                    console.log("AttackCommand processed: ", attackCommand);
                    break;
                case "mine":
                    const mineCommand = command as MineCommand;
                    console.log("MineCommand processed: ", mineCommand);
                    break;
                default:
                    console.error("Invalid command: ", command);
                    break;
            }
        });
    }

    private handleMoveCommand(comm: MoveCommand, entity: GameEntity) {
        if (!(entity instanceof Unit)) {
            console.error("This entity cannot move!");
            return;
        }
        entity.handleMoveCommand(comm.destination);
    }
}
