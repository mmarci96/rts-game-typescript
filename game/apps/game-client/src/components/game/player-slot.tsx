import { Player } from "../../types";

interface PlayerSlotParams {
    player: Player | null;
    onClickJoin: () => {};
}

export const PlayerSlot = ({ player, onClickJoin }: PlayerSlotParams) => {
    return (
        <div className="w-40 h-28 bg-[#11101B] p-4 m-2 rounded-2xl">
            {player ? (
                <div className="flex flex-col">
                    <p className="p-2"> Player: {player.name} </p>
                    <p className="p-2">
                        Status: {player.isReady ? "Ready" : "Waiting"}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col">
                    <p className="p-2">Empty</p>
                    <button onClick={onClickJoin}>Join</button>
                </div>
            )}
        </div>
    );
};
