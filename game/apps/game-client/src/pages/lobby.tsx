import { useParams } from "react-router-dom";
import { AnimatedComponent } from "../components/common/animated-component";
import DefaultLayout from "../layouts/default";
import { useEffect, useState } from "react";
import { useApiRequest } from "../hooks/use-api-request";
import { GameData, HttpMethod, Player, PlayerColor } from "../types";
import { JoinGameForm } from "../components/forms/join-game-form";
import { PopupCard } from "../components/common/popup-card";
import { Slots } from "../components/game/slots";

const Lobby = () => {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [joinedPlayers, setJoinedPlayers] = useState<Player[]>([]);
    const [availableColors, setAvailableColors] = useState<PlayerColor[]>([]);
    const [remainingSlots, setRemainingSlots] = useState(0);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [counter, setCounter] = useState(0);

    const { gameId } = useParams();
    const { fetchApiData, error } = useApiRequest();

    const fetchGameData = async (gameId: string) => {
        const { game, players } = await fetchApiData(
            `/api/games/${gameId}`,
            HttpMethod.GET,
            null,
        );

        if (players.length !== joinedPlayers.length) {
            onUpdateLobby(game, players);
        }
    };
    const handleJoin = async (selectedColor: PlayerColor) => {
        const player: Player = await fetchApiData(
            `/api/games/${gameId}`,
            HttpMethod.PATCH,
            {
                userId: window.localStorage.getItem("userId"),
                color: selectedColor,
            },
        );

        if (player && gameId) {
            setIsPopupOpen(false);
            await fetchGameData(gameId);
        }
    };
    const onUpdateLobby = (game: GameData, players: Player[]) => {
        setGameData(game as GameData);
        setJoinedPlayers(players as Player[]);
        setRemainingSlots(game.maxPlayers - players.length);
    };

    const handleClose = () => {
        setIsPopupOpen(false);
    };
    const handleOpen = () => {
        setIsPopupOpen(true);
    };

    useEffect(() => {
        gameId && fetchGameData(gameId);
    }, [counter]);

    useEffect(() => {
        const colors = Object.values(PlayerColor);

        const colorsTaken: PlayerColor[] = joinedPlayers.flatMap(
            (player: Player) => player.color as PlayerColor,
        );
        const filterAvailable = colors.filter(
            (color: PlayerColor) => !colorsTaken.includes(color) && color,
        );
        setAvailableColors(filterAvailable);
    }, [joinedPlayers, isPopupOpen]);

    useEffect(() => {
        setInterval(() => {
            setCounter((counter: number) => counter + 1);
        }, 3000);
    }, []);

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
                        players={joinedPlayers}
                        remainingSlots={remainingSlots}
                        onClickJoin={handleOpen}
                    />
                </div>

                {error && <p>{error}</p>}
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Lobby;
