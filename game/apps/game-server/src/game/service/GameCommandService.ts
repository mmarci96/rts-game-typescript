import Game from "../Game";
import { AttackCommand, Command, MineCommand, MoveCommand, Player, TrainCommand } from "@packages/game-data/dist";

export class GameCommandService {
    handlePlayerCommands(game: Game, commands: Command[], player: Player): void {
        console.log("Game",game);
        console.log("Player",player);
        
        commands.forEach(command => {
            switch (command.commandType) {
                case "move":
                    const moveCommand = command as MoveCommand;
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
        })
    }
}
