import { JoinedPlayers } from "@/components/joined-players";
import { title } from "@/components/primitives";
import { useUserContext } from "@/context/user-context";
import { useApiRequest } from "@/hooks/use-apirequest";
import DefaultLayout from "@/layouts/default";
import { GameData, HttpMethod, Player } from "@/types";
import { Button } from "@heroui/button";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LobbyPage() {
    const [joinedPlayers, setJoinedPlayers] = useState<Player[]>([]);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [startable, setStartable] = useState(false);
    const { gameId } = useParams();
    const { fetchApiData } = useApiRequest();
    const { userData } = useUserContext();
    const fetchGameData = async (gameId: string) => {
        const { game, players }: { game: GameData; players: Player[] } =
            await fetchApiData("/api/games/" + gameId, HttpMethod.GET, null);
        if (!game && !players) {
            return;
        }
        console.log("Game data: ", game);
        console.log("Players: ", players);

        if (game?.status === "ready") {
            console.log("READY");
            //Redirect to game with playerid and gameid
            const player = players.find(
                (p: Player) => p.userId === userData.id,
            );
            window.location.href = "/game/" + gameId + player?._id;
        }
        if (players.length !== joinedPlayers.length) {
            setJoinedPlayers(players);
            setGameData(game);
        }
        if (players.length === game.maxPlayers) {
            setStartable(true);
        }
    };

    const handleStart = async () => {
        const url = "/api/games/start/" + gameId;
        await fetchApiData(url, HttpMethod.PATCH, null);
    };

    useEffect(() => {
        !gameData && gameId && fetchGameData(gameId);
        setInterval(() => {
            gameId && fetchGameData(gameId);
        }, 3000);
    }, [gameId]);

    return (
        <DefaultLayout>
            <span
                className="absolute inset-0  w-screen h-screen bg-cover bg-center"
                style={{ backgroundImage: "url('/lobby.png')" }}
            ></span>

            <span className="absolute inset-0  w-screen  bg-cover bg-center bg-gradient-to-b dark:from-background-50 to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-10"></span>

            <section className="absolute inset-0  w-screen h-full bg-cover bg-center bg-gradient-to-t from-slate-300 dark:from-background to-transparent flex flex-col items-center justify-center gap-4 p-4 md:py-8 pb-0">
                <div className="inline-block max-w-lg text-center justify-center">
                    <h1 className={title()}>Lobby</h1>
                </div>
                {joinedPlayers ? (
                    <>
                        <JoinedPlayers players={joinedPlayers} />
                        {startable && (
                            <Button onPress={handleStart}>Start</Button>
                        )}
                    </>
                ) : (
                    <p>loading..</p>
                )}
            </section>
        </DefaultLayout>
    );
}
