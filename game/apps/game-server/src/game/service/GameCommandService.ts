import { createUnit } from "@packages/game-db";
import Game from "../Game";
import {
    AttackCommand,
    Command,
    GameEntity,
    MainBuilding,
    MineCommand,
    MoveCommand,
    Player,
    TrainCommand,
    Unit,
} from "@packages/game-data/dist";
import { mapMongoUnitToData } from "../../utils/parseData";

const UNIT_CONSTRUCTION_COST = {
    warrior: { food: 20, wood: 20 },
    worker: { food: 20, wood: 0 },
    archer: { food: 30, wood: 30 },
} as const;
type UnitType = keyof typeof UNIT_CONSTRUCTION_COST;

export class GameCommandService {
    async handlePlayerCommands(
        game: Game,
        commands: Command[],
        player: Player,
    ) {
        for (const command of commands) {
            const entity = game
                .getLogic()
                .getEntityById(command.targetEntityId);
            if (!entity) {
                console.error("No entity found: ", command.targetEntityId);
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
                    await this.handleTrainCommand(
                        trainCommand,
                        entity,
                        player,
                        game,
                    );
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
        }
    }

    async handleTrainCommand(
        command: TrainCommand,
        building: GameEntity,
        player: Player,
        game: Game,
    ) {
        if (!(building instanceof MainBuilding)) {
            console.error("Entity cannot train units");
            return;
        }
        const { wood, food } = player.getResources();
        const unitType = command.unitType as UnitType;
        const cost = UNIT_CONSTRUCTION_COST[unitType];
        if (cost.food > food || cost.wood > wood) {
            console.error("Not enough resources!");
            return;
        }
        player.spendFood(cost.food);
        player.spendWood(cost.wood);
        const data = building.createUnit(unitType);
        const savedUnit = await createUnit(
            game.getId(),
            data.spawnX,
            data.spawnY,
            data.color,
            data.unitType,
        );
        if (savedUnit) {
            const unitData = mapMongoUnitToData(savedUnit);
            game.getLogic().addCreatedUnit(unitData);
        }
    }

    private handleMoveCommand(comm: MoveCommand, entity: GameEntity) {
        if (!(entity instanceof Unit)) {
            console.error("This entity cannot move!");
            return;
        }
        entity.handleMoveCommand(comm.destination);
    }
}
