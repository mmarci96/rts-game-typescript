import { useParams } from "react-router-dom";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { Player, PlayerSlot } from "../components/game/player-slot";
import { GameData } from "../types";

const Lobby = () => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [selectedColor, setSelectedColor] = useState("red");
    const [players, setPlayers] = useState<Player[]>([]);
    const { gameId } = useParams();
    const fetchGameData = async (gameId: string) => {
        try {
            const res = await fetch(`/api/games/${gameId}`);
            const { data } = await res.json();

            setGameData(data.game);
            setPlayers(data.players);
        } catch (err) {
            console.error(err);
        }
    };
    const joinLobby = async () => {
        try {
            const res = await fetch(`/api/games${gameId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: window.localStorage.getItem("userId"),
                    color: selectedColor,
                }),
            });
            const { data } = await res.json();
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    };
    const handleJoin = async () => {
        console.log("Joining...");
    };

    useEffect(() => {
        gameId && fetchGameData(gameId);
    }, []);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <ul className="bg-gray-400">
                    Players:
                    {players?.map((player: Player) => (
                        <li key={player.name}>
                            <PlayerSlot
                                player={player}
                                onClickJoin={handleJoin}
                            />
                        </li>
                    ))}
                </ul>
                <div>
                    <button onClick={joinLobby}>Join</button>
                </div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Lobby;
