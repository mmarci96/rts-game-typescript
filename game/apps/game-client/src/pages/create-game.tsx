import { useEffect, useState } from "react";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { MapList } from "../components/game/map-list";

export interface GameMap {
    _id: string;
    type: string;
    size: string;
}
const CreateGame = () => {
    const [gameMaps, setGameMaps] = useState<GameMap[]>([]);
    const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
    const fetchGameMaps = async () => {
        const res = await fetch("/api/maps");
        const { data } = await res.json();
        setGameMaps(data);
    };
    useEffect(() => {
        fetchGameMaps();
    }, []);
    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div className="m-4">
                    {selectedMap ? (
                        <p>next step</p>
                    ) : (
                        <MapList maps={gameMaps} onSelect={setSelectedMap} />
                    )}
                </div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default CreateGame;
