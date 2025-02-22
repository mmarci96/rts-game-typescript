import { Player } from "../../types";

interface PlayerSlotParams {
    player: Player | null;
    onClickJoin: () => {};
}

export const PlayerSlot = ({ player, onClickJoin }: PlayerSlotParams) => {
    return (
        <div className="w-36 h-24 bg-gray-800 p-2 m-2 rounded-2xl">
            {player ? (
                <p>
                    Player: {player.name} - Status:{" "}
                    {player.isReady ? "Ready" : "Waiting"}
                </p>
            ) : (
                <button onClick={onClickJoin}>Join</button>
            )}
        </div>
    );
};
