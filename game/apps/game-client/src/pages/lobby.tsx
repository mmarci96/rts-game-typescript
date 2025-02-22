import { useParams } from "react-router-dom";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { GameData, Player, PlayerColor } from "../types";
import { JoinGameForm } from "../components/forms/join-game-form";
import { PopupCard } from "../components/common/popup-card";
import { Slots } from "../components/game/slots";

const Lobby = () => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [availableColors, setAvailableColors] = useState<PlayerColor[]>([]);
    const [remainingSlots, setRemainingSlots] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const { gameId } = useParams();

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
    const handleJoin = async (selectedColor: PlayerColor) => {
        try {
            const res = await fetch(`/api/games/${gameId}`, {
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
            const emptySlots = data.maxPlayers - data.length;
            setRemainingSlots(emptySlots);
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    };
    const handleClose = () => {
        setIsPopupOpen(false);
    };
    const handleOpen = () => {
        setIsPopupOpen(true);
    };

    useEffect(() => {
        gameId && fetchGameData(gameId);
    }, []);

    useEffect(() => {
        const colors = Object.values(PlayerColor);

        const colorsTaken: PlayerColor[] = players.flatMap(
            (player: Player) => player.color as PlayerColor,
        );
        const filterAvailable = colors.filter(
            (color: PlayerColor) => !colorsTaken.includes(color) && color,
        );
        console.log(filterAvailable);
        setAvailableColors(filterAvailable);
    }, [players, isPopupOpen]);

    return (
        <AnimatedComponent>
            <DefaultLayout>
                <div className="w-screen flex flex-col items-center justify-center p-4">
                    {isPopupOpen && (
                        <PopupCard
                            onClose={handleClose}
                            header="Choose color to join"
                            footer="Joining"
                        >
                            <JoinGameForm
                                onSubmit={handleJoin}
                                availableColors={availableColors}
                            />
                        </PopupCard>
                    )}
                    <Slots
                        players={players}
                        remainingSlots={remainingSlots}
                        onClickJoin={handleOpen}
                    />
                </div>
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Lobby;
