import { useEffect, useState } from "react";
import { AnimatedComponent } from "../components/common/animated-component";
import { useApiRequest } from "../hooks/use-api-request";
import DefaultLayout from "../layouts/default";
import { GameData, HttpMethod } from "../types";

const Games = () => {
    const [gameLobbyList, setGameLobbyList] = useState<GameData[]>([]);
    const { fetchApiData, error, loading } = useApiRequest();
    useEffect(() => {
        const main = async (url: string, method: HttpMethod) => {
            const games: GameData[] = await fetchApiData(url, method, null);
            games && setGameLobbyList(games);
        };
        main("/api/games", HttpMethod.GET);
    }, []);
    useEffect(() => {
        console.log(gameLobbyList);
    }, [gameLobbyList]);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div>Games</div>
                {}
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Games;
