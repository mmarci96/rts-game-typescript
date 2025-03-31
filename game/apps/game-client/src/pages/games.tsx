import { useEffect, useState } from "react";
import { AnimatedComponent } from "../components/common/animated-component";
import { useApiRequest } from "../hooks/use-api-request";
import DefaultLayout from "../layouts/default";
import { GameData, HttpMethod } from "../types";
import { LoadingAnimation } from "../layouts/fallback";
import { Link } from "react-router-dom";

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
                <div className="m-4">
                    <h1>Games</h1>
                </div>
                <ul className="flex flex-wrap justify-center">
                    {gameLobbyList?.map((gameData: GameData) => (
                        <li
                            className="mx-4 m-2 flex flex-col items-center w-1/3 border-gray-400 rounded-2xl p-3 border-2"
                            key={gameData._id}
                        >
                            <p>
                                Game:{" "}
                                {gameData.gameName
                                    ? gameData.gameName
                                    : gameData._id}
                            </p>
                            <p>
                                {gameData.status}/{gameData.maxPlayers}
                            </p>
                            <p>
                                {new Date(
                                    gameData.createdAt,
                                ).toLocaleDateString()}
                            </p>
                            <Link to={`/lobby/${gameData._id}`}>
                                <button>View Lobby</button>
                            </Link>
                        </li>
                    ))}
                </ul>
                {loading && <LoadingAnimation />}
                {error && (
                    <p className="m-4 text-red-600 text-xl italic">{error}</p>
                )}
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Games;
