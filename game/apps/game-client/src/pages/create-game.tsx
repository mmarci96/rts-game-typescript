import { useEffect, useState } from "react";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { MapList } from "../components/game/map-list";
import {
    CreateGameForm,
    PlayerColor,
} from "../components/forms/create-game-form";
import { useNavigate } from "react-router-dom";

export interface GameMap {
    _id: string;
    type: string;
    size: string;
}
const CreateGame = () => {
    const [error, setError] = useState("");
    const [gameMaps, setGameMaps] = useState<GameMap[]>([]);
    const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
    const navigate = useNavigate();

    const fetchGameMaps = async () => {
        const res = await fetch("/api/maps");
        const { data } = await res.json();
        setGameMaps(data);
    };
    const handleSubmit = async (color: PlayerColor, maxPlayers: number) => {
        const userId = window.localStorage.getItem("userId");
        const requestData = {
            color,
            maxPlayers,
            mapId: selectedMap?._id,
            userId,
        };
        try {
            const res = await fetch("/api/games", {
                method: "POST",
                body: JSON.stringify(requestData),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const { data } = await res.json();
            console.log(data.game._id);
            if (data.game._id) {
                navigate(`/lobby/${data.game._id}`);
            }
        } catch (err) {
            setError(err as string);
        }
    };

    useEffect(() => {
        fetchGameMaps();
    }, []);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div className="m-4">
                    {selectedMap ? (
                        <CreateGameForm onSubmit={handleSubmit} />
                    ) : (
                        <MapList maps={gameMaps} onSelect={setSelectedMap} />
                    )}
                </div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default CreateGame;
