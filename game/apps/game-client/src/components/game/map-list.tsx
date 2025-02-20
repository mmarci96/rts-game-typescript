import { GameMap } from "../../pages/create-game";
import { LilCard } from "../common/lil-card";
interface MapListProps {
    maps: GameMap[];
    onSelect: (gameMap: GameMap) => void;
}
export const MapList = ({ maps, onSelect }: MapListProps) => {
    return (
        <ul className="flex flex-wrap justify-center ">
            {maps?.length &&
                maps.map((gameMap) => (
                    <li key={gameMap._id} className="mx-4 m-2">
                        <LilCard
                            header={gameMap.type}
                            footer="Made with perlim noise."
                        >
                            <h2>Size: {gameMap.size}</h2>
                            <button
                                className="m-2"
                                onClick={() => onSelect(gameMap)}
                            >
                                Select map
                            </button>
                        </LilCard>
                    </li>
                ))}
        </ul>
    );
};
