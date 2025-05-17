import { JoinedPlayers } from "@/components/joined-players";
import { title } from "@/components/primitives";
import { useApiRequest } from "@/hooks/use-apirequest";
import DefaultLayout from "@/layouts/default";
import { HttpMethod, Player } from "@/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LobbyPage() {
    const [joinedPlayers, setJoinedPlayers] = useState<Player[]>([]);
    const { gameId } = useParams();
    const { fetchApiData } = useApiRequest();
    const fetchGameData = async (gameId: string) => {
        const { game, players } = await fetchApiData(
            "/api/games/" + gameId,
            HttpMethod.GET,
            null,
        );
        console.log("Game data: ", game);
        console.log("Players: ", players);
        setJoinedPlayers(players);
    };
    useEffect(() => {
        console.log(gameId);
        gameId && fetchGameData(gameId);
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
                    <JoinedPlayers players={joinedPlayers} />
                ) : (
                    <p>loading..</p>
                )}
            </section>
        </DefaultLayout>
    );
}
