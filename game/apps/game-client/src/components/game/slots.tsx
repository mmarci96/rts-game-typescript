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
    const [currentPlayer, setCurrentPlayer] = useState<null | Player>(null);
    const [emptySlots, setEmptySlots] = useState<string[]>([]);
    const createEmptySlots = (slotCount: number) => {
        const slots = [];
        for (let i = 0; i < slotCount; i++) {
            const slot = "Empty-" + i;
            slots.push(slot);
        }
        setEmptySlots(slots);
    };
    const findCurrentPlayer = (players: Player[]) => {
        const userId = window.localStorage.getItem("userId");
        const currentPlayer = players.find(
            (player: Player) => player.userId === userId,
        );
        if (currentPlayer) {
            setCurrentPlayer(currentPlayer);
        }
    };

    useEffect(() => {
        createEmptySlots(remainingSlots);
        findCurrentPlayer(players);
        console.log(players);
        console.log("currentPlayer", currentPlayer);
    }, [players]);

    return (
        <ul className="bg-gray-800 m-2 p-1  rounded-2xl mt-8 w-[80vw] h-[72vh] flex flex-wrap justify-evenly">
            {players?.map((player: Player, i) => (
                <li className="m-8" key={player?.name || i}>
                    <PlayerSlot player={player} onClickJoin={() => {}} />
                </li>
            ))}
            {!currentPlayer &&
                emptySlots?.map((slot: string, i: number) => (
                    <li className="m-8" key={slot + i}>
                        <PlayerSlot player={null} onClickJoin={onClickJoin} />
                    </li>
                ))}
            <div className="w-[80vw] rounded-2xl x-auto mt-auto mb-0 min-h-[240px] ring-[#1E2939] ring-4  bg-[#0F141E]"></div>
        </ul>
    );
};
