import { useParams } from "react-router-dom";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { PlayerSlot } from "../components/game/player-slot";
import { GameData, Player } from "../types";

const Lobby = () => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [selectedColor, setSelectedColor] = useState("red");
    const [players, setPlayers] = useState<Player[]>([]);
    const [emptySlots, setEmptySlots] = useState<string[]>([]);
    const { gameId } = useParams();
    const createEmptySlots = (slotCount: number) => {
        const slots = [];
        for (let i = 0; i < slotCount; i++) {
            const slot = "Empty-" + i;
            slots.push(slot);
        }
        setEmptySlots(slots);
    };
    const fetchGameData = async (gameId: string) => {
        try {
            const res = await fetch(`/api/games/${gameId}`);
            const { data } = await res.json();

            setGameData(data.game as GameData);
            setPlayers(data.players as Player[]);
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
    useEffect(() => {
        console.log(gameData);

        if (gameData) {
            const remainingSlots = gameData.maxPlayers - players.length;
            createEmptySlots(remainingSlots);
            console.log(remainingSlots);
        }
    }, [gameData]);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <ul className="bg-gray-400 p-8 rounded-2xl backdrop-blur-2xl">
                    Players:
                    {players?.map((player: Player) => (
                        <li key={player.name}>
                            <PlayerSlot
                                player={player}
                                onClickJoin={handleJoin}
                            />
                        </li>
                    ))}
                    {emptySlots?.map((slot: string, i: number) => (
                        <li key={i}>
                            <p>{slot}</p>
                            <PlayerSlot
                                player={null}
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
