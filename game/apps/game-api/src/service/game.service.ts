import { GameModel, PlayerModel } from "@packages/game-db";
import { Types } from "mongoose";
import { generateStarterUnits } from "./unit.service";
import { PlayerColor } from "@packages/game-data/dist/data/types";

export const createLobby = async (userId: Types.ObjectId, mapId: Types.ObjectId, color: PlayerColor) => {
    const newGame = new GameModel({ map: mapId });
    const game = await newGame.save();
    const gameId = game._id;

    const newPlayer = new PlayerModel({
        gameId, userId, color
    })
    const player = await newPlayer.save();

    const updatedGame = await addPlayerToGame(player._id, gameId);

}


export const addPlayerToGame = async (playerId: Types.ObjectId, gameId: Types.ObjectId) => {
    const gameUpdate = await GameModel.findByIdAndUpdate(gameId, {
        $push: { players: playerId }
    })
    return gameUpdate;
}
