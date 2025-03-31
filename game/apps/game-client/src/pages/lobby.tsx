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
    const [isStartable, setStartable] = useState(false);
    const [showCountdown, setShowCountdown] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const { gameId } = useParams();
    const { fetchApiData, error } = useApiRequest();

    const fetchGameData = async (gameId: string) => {
        const { game, players } = await fetchApiData(
            `/api/games/${gameId}`,
            HttpMethod.GET,
            null,
        );
        if (game?.status === "ready") {
            console.log(game.status);
            setShowCountdown(true);
            let timeLeft = 5;
            const countdownInterval = setInterval(() => {
                const userId = window.localStorage.getItem("userId");
                const player = players.find(
                    (player: Player) => player.userId === userId && player,
                );
                setCountdown(timeLeft);
                timeLeft -= 1;
                if (timeLeft < 0) {
                    clearInterval(countdownInterval);
                    //const gameUrl = `http://localhost:3000/${gameId}/${player._id}`;
                    //const gameUrl = `http://localhost/${gameId}/${player._id}`;
                    const baseGameUrl = import.meta.env.VITE_GAME_BASE_URL;
                    const gameUrl = `${baseGameUrl}/game-ui/${gameId}/${player._id}`;
                    window.location.href = gameUrl;
                }
            }, 1000);
        }

        if (players.length !== joinedPlayers.length) {
            onUpdateLobby(game, players);
        }
        if (players.length === game.maxPlayers) {
            setStartable(true);
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
    const handleLeave = async () => {
        const url = "/api/players/" + window.localStorage.getItem("userId");
        const res = await fetchApiData(url, HttpMethod.DELETE, null);
        if (res) {
            // console.log(res);
        }
    };
    const handleStart = async () => {
        const url = "/api/games/start/" + gameId;
        await fetchApiData(url, HttpMethod.PATCH, null);
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
        !gameData && gameId && fetchGameData(gameId);
        setInterval(() => {
            gameId && fetchGameData(gameId);
        }, 3000);
    }, []);

    useEffect(() => {
        const colors = [PlayerColor.RED, PlayerColor.BLUE]; // Object.values(PlayerColor);

        const colorsTaken: PlayerColor[] = joinedPlayers.flatMap(
            (player: Player) => player.color as PlayerColor,
        );
        const filterAvailable = colors.filter(
            (color: PlayerColor) => !colorsTaken.includes(color) && color,
        );
        setAvailableColors(filterAvailable);
    }, [joinedPlayers, isPopupOpen]);

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
                    {showCountdown && (
                        <PopupCard
                            onClose={() => {}}
                            header="Game Starting"
                            footer="Get Ready!"
                        >
                            <p className="text-center text-xl font-bold">
                                Game staring soon...
                            </p>
                        </PopupCard>
                    )}
                    <Slots
                        players={joinedPlayers}
                        remainingSlots={remainingSlots}
                        onClickJoin={handleOpen}
                    />

                    <div className="flex">
                        {isStartable && (
                            <button onClick={handleStart}>Start</button>
                        )}
                        <button
                            className="accent-red-600"
                            onClick={handleLeave}
                        >
                            Leave
                        </button>
                    </div>
                </div>

                {error && <p>{error}</p>}
            </DefaultLayout>
        </AnimatedComponent>
    );
};

export default Lobby;
