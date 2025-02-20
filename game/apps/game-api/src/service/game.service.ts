import {
    GameModel,
    GameStatus,
    MapModel,
    PlayerModel,
} from "@packages/game-db";
import { Types } from "mongoose";
import { PlayerColor } from "@packages/game-data/dist/data/types";
import { generateStarterUnits } from "./unit.service";
import { createMainBuilding } from "./building.service";
import { generateResources } from "./resource.service";

export const createGame = async (
    userId: Types.ObjectId,
    mapId: Types.ObjectId,
    color: PlayerColor,
    maxPlayers: number,
) => {
    const newGame = new GameModel({ mapId: mapId, maxPlayers });
    const game = await newGame.save();
    const gameId = game._id;

    const newPlayer = new PlayerModel({
        gameId,
        userId,
        color,
    });
    const player = await newPlayer.save();
    return { game, player };
};

export const joinGame = async (
    userId: Types.ObjectId,
    color: PlayerColor,
    gameId: Types.ObjectId,
) => {
    const game = await GameModel.findById(gameId);
    if (!game) {
        throw new Error("Game not found!");
    }
    const joinedPlayers = await PlayerModel.find({ gameId });
    if (joinedPlayers.length >= game.maxPlayers) {
        throw new Error("No slots left to join this game!");
    }

    const player = new PlayerModel({
        gameId: game._id,
        userId,
        color,
    });

    return await player.save();
};

export const getGameById = async (gameId: Types.ObjectId) => {
    const game = await GameModel.findById(gameId);
    if (!game) {
        throw new Error("No game found with id!");
    }

    return game;
};

export const startGame = async (gameId: Types.ObjectId) => {
    const players = await PlayerModel.find({ gameId });
    const gameCheck = await GameModel.findById(gameId);
    if (!gameCheck) {
        throw new Error("Game data corrupted!");
    }
    if (players.length < gameCheck.maxPlayers) {
        throw new Error(
            `Cannot start game, at least ${gameCheck.maxPlayers} player must join`,
        );
    }

    const game = await GameModel.findByIdAndUpdate(gameId, {
        status: GameStatus.READY,
    });
    if (!game) {
        throw new Error("No game found!");
    }

    const map = await MapModel.findById(game.mapId);
    if (!map) {
        throw new Error("No map found!");
    }

    const data = await Promise.all(
        players.map((player) => {
            if (!player) return;
            const units = generateStarterUnits(
                player.color,
                map.tiles.length,
                game._id,
            );
            const building = createMainBuilding(
                player.color,
                map.tiles.length,
                game._id,
            );
            return { units, building };
        }),
    );

    const resources = await generateResources(map.tiles.length, game._id);

    return { ...data, resources };
};

export const getGamesToJoin = async () => {
    const games = await GameModel.find({ status: GameStatus.WAITING });
    if (!games) {
        return [];
    }

    return games;
};

export const deleteGame = async (gameId: Types.ObjectId) => {
    const game = await GameModel.findById(gameId);
    if (game?.status !== GameStatus.WAITING) {
        throw new Error("Game already running, cannot delete.");
    }
    const deletedGame = await GameModel.findByIdAndDelete(gameId);
    return deletedGame;
};
