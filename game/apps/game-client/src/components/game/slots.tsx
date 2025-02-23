import { useState, useEffect } from "react";
import { Player } from "../../types";
import { PlayerSlot } from "./player-slot";
interface SlotsParams {
    players: Player[];
    remainingSlots: number;
    onClickJoin: () => void;
}

export const Slots = ({
    players,
    remainingSlots,
    onClickJoin,
}: SlotsParams) => {
    const [emptySlots, setEmptySlots] = useState<string[]>([]);
    const createEmptySlots = (slotCount: number) => {
        const slots = [];
        for (let i = 0; i < slotCount; i++) {
            const slot = "Empty-" + i;
            slots.push(slot);
        }
        setEmptySlots(slots);
    };
    useEffect(() => {
        createEmptySlots(remainingSlots);
    }, [players]);

    return (
        <ul className="bg-gray-400 p-8 rounded-2xl mt-8">
            Players:
            {players?.map((player: Player, i) => (
                <li key={player?.name || i}>
                    <PlayerSlot player={player} onClickJoin={() => {}} />
                </li>
            ))}
            {emptySlots?.map((slot: string, i: number) => (
                <li key={slot + i}>
                    <p>{slot}</p>
                    <PlayerSlot player={null} onClickJoin={onClickJoin} />
                </li>
            ))}
        </ul>
    );
};
