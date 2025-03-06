import Game from "../Game";

export class GameCommandService {
    handlePlayerCommands(game: Game, commands: any[], playerId: string): void {
        game.getLogic().handlePlayerCommands(commands, playerId);
    }
}
