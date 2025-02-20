import { useParams } from "react-router-dom";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";

interface GameData {
    _id: string;
    mapId: string;
    status: string;
    maxPlayers: number;
    createdAt: Date;
}

const Lobby = () => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const { gameId } = useParams();
    const fetchGameData = async (gameId: string) => {
        try {
            const res = await fetch(`/api/games/${gameId}`);
            const { data } = await res.json();

            setGameData(data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        gameId && fetchGameData(gameId);
    }, []);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div>Lobby</div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Lobby;
