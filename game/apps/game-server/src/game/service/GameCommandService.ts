import Game from "../Game";
import { Player } from "@packages/game-data";

export class GameCommandService {
    handlePlayerCommands(game: Game, commands: any[], player: Player): void {
        game.getLogic().handlePlayerCommands(commands, player);
    }
}
