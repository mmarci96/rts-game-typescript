import { SyntheticEvent, useState } from "react";
import { PlayerColor } from "../../types";

interface GameFormProps {
    onSubmit: (color: PlayerColor) => void;
    availableColors: PlayerColor[];
}
export const JoinGameForm = ({ onSubmit, availableColors }: GameFormProps) => {
    const [selectedColor, setSelectedColor] = useState<PlayerColor>(
        availableColors[0],
    );
    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        onSubmit(selectedColor);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <div className="flex justify-between">
                <label className="m-2 text-lg" htmlFor="color">
                    Choose Color:
                </label>
                <select
                    className="m-2 mr-auto p-2 rounded-xl bg-gray-800 border-1 border-gray-600"
                    id="color"
                    name="color"
                    value={selectedColor}
                    onChange={(e) => {
                        const selected = e.target.value as PlayerColor;
                        setSelectedColor(selected);
                    }}
                >
                    {Object.values(PlayerColor).map((color, i) => (
                        <option key={i} value={color}>
                            {color[0].toUpperCase() + color.substring(1)}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit">Join</button>
        </form>
    );
};
