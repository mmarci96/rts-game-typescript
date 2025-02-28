import { GameMap, Tile } from "@packages/game-data";
import { IMap } from "@packages/game-db";
import Game from "./Game";
import AssetManager from "./data/AssetManager";

class GameLoader {
    static async fetchMapById(id: string) {
        const res = await fetch("/api/maps/" + id);
        const { data } = await res.json();
        const gameMap: IMap = data;
        return gameMap.tiles;
    }
    static async loadAssets() {
        const assetManager = new AssetManager();
        await assetManager.loadAssets();
        return assetManager;
    }
    static async loadGame(mapId: string) {
        const mapTiles: Tile[][] = await this.fetchMapById(mapId);
        const gameMap = new GameMap(mapTiles);
        const assetManager = await this.loadAssets();
        const game = new Game(gameMap, assetManager);
        return game;
    }
}

export default GameLoader;
