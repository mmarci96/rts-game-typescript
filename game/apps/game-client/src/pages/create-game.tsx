import { useEffect, useState } from "react";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
interface GameMap {
    _id: string;
    type: string;
    size: string;
}
const CreateGame = () => {
    const [gameMaps, setGameMaps] = useState<GameMap[]>([]);
    const fetchGameMaps = async () => {
        const res = await fetch("/api/maps");
        const { data } = await res.json();
        console.log(data);
    };
    useEffect(() => {
        fetchGameMaps();
    }, []);
    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div>Games</div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default CreateGame;
