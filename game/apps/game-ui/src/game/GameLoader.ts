import { Tile } from "@packages/game-data";
import { IMap, IPlayer } from "@packages/game-db";
import Game from "./Game";
import AssetManager from "./data/AssetManager";

class GameLoader {
    static async fetchMapByGameId(gameId: string) {
        const res = await fetch("/api/maps/by-game-id/" + gameId);
        const { data } = await res.json();
        const gameMap: IMap = data;
        return gameMap.tiles;
    }
    static async fetchPlayerById(id: string) {
        const res = await fetch("/api/players/" + id);
        const { data } = await res.json();
        const player: IPlayer = data;
        return player;
    }
    static async loadAssets() {
        const assetManager = new AssetManager();
        await assetManager.loadAssets();
        return assetManager;
    }
    static async loadGame(gameId: string, playerId: string) {
        const mapTiles: Tile[][] = await this.fetchMapByGameId(gameId);
        const player = await this.fetchPlayerById(playerId);
        const assetManager = await this.loadAssets();
        const game = new Game(assetManager, mapTiles, player);
        return game;
    }
}

export default GameLoader;
