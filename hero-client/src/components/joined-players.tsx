import { Player } from "@/types";
import { PlayerCard } from "./player-card";
interface JoinedPlayersProps {
    players: Player[];
}
export const JoinedPlayers = ({ players }: JoinedPlayersProps) => {
    return (
        <ul>
            JoinedPlayers
            {players.map((player) => (
                <li key={player._id}>
                    <PlayerCard player={player} />
                </li>
            ))}
        </ul>
    );
};
