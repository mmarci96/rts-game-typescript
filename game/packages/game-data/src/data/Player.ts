import { PlayerColor, PlayerResources } from "./types";

class Player {
    private playerId;
    private color;
    private resources: PlayerResources;
    private gameId: string;
    private name: string;

    /**
     * @param { string } playerId
     * @param { string } color
     */
    constructor(
        playerId: string,
        color: PlayerColor,
        gameId: string,
        name: string,
    ) {
        this.gameId = gameId;
        this.playerId = playerId;
        this.color = color;
        this.name = name;
        this.resources = { wood: 0, food: 0 };
    }

    getName() {
        return this.name;
    }

    getGameId() {
        return this.gameId;
    }

    spendWood(amount: number) {
        if (this.resources.wood < amount) {
            console.log("not enough wood!");
            return;
        }
        this.resources.wood = this.resources.wood - amount;
    }

    spendFood(amount: number) {
        if (this.resources.food < amount) {
            console.log("not enough food!");
            return;
        }
        this.resources.food = this.resources.food - amount;
    }

    setFood(amount: number) {
        this.resources.food = amount;
    }

    setWood(amount: number) {
        this.resources.wood = amount;
    }

    setResources(resources: PlayerResources) {
        this.resources = resources;
    }

    getResources() {
        return this.resources;
    }

    /**
     * @returns PlayerColor
     */
    getColor() {
        return this.color;
    }

    /**
     * @returns string
     */
    getId() {
        return this.playerId;
    }
}

export default Player;
