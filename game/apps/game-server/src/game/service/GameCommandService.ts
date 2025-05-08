import { createUnit } from "@packages/game-db";
import Game from "../Game";
import {
    Attackable,
    AttackCommand,
    Command,
    MainBuilding,
    MineCommand,
    MoveCommand,
    Player,
    TrainCommand,
    Worker,
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
            switch (command.commandType) {
                case "move":
                    const moveCommand = command as MoveCommand;
                    this.handleMoveCommand(moveCommand, game);
                    console.log("Movecommand processed: ", moveCommand);
                    break;
                case "train":
                    const trainCommand = command as TrainCommand;
                    console.log("Traincommand processed: ", trainCommand);
                    await this.handleTrainCommand(trainCommand, player, game);
                    break;
                case "attack":
                    const attackCommand = command as AttackCommand;
                    console.log("AttackCommand processed: ", attackCommand);
                    this.handleAttackCommand(attackCommand, game);
                    break;
                case "mine":
                    const mineCommand = command as MineCommand;
                    console.log("MineCommand processed: ", mineCommand);
                    this.handleMineCommand(mineCommand, game);
                    break;
                default:
                    console.error("Invalid command: ", command);
                    break;
            }
        }
    }

    private handleMineCommand(command: MineCommand, game: Game) {
        const worker = game.getLogic().getUnitById(command.targetEntityId);
        if (!(worker instanceof Worker)) {
            console.error("Unit cannot mine!");
            return;
        }
        const resource = game
            .getLogic()
            .getResourceById(command.resourceTargetId);
        if (!resource) {
            console.error("No target resource found");
            return;
        }
        worker.setStatus("moving");
        worker.collectResource(resource);
    }

    private handleAttackCommand(command: AttackCommand, game: Game) {
        const unit = game.getLogic().getUnitById(command.targetEntityId);
        if (!unit) {
            console.error("No unit found: ", command.targetEntityId);
            return;
        }
        const victim = game.getLogic().getEntityById(command.atttackTargetId);
        if (!(victim instanceof Attackable)) {
            console.error("No target found: ", command.atttackTargetId);
            return;
        }
        unit.setAttackableTarget(victim as Attackable);
        unit.setStatus("moving");
    }

    private async handleTrainCommand(
        command: TrainCommand,
        player: Player,
        game: Game,
    ) {
        const building = game
            .getLogic()
            .getBuildingById(command.targetEntityId);
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

    private handleMoveCommand(command: MoveCommand, game: Game) {
        const unit = game.getLogic().getUnitById(command.targetEntityId);
        if (!unit) {
            console.error("Entity not found!");
            return;
        }
        unit.handleMoveCommand(command.destination);
    }
}
