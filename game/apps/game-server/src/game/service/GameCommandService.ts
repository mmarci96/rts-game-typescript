import Game from "../Game";

export class GameCommandService {
    handlePlayerCommands(game: Game, commands: any[]): void {
        game.getLogic().handlePlayerCommands(commands);
    }
}
