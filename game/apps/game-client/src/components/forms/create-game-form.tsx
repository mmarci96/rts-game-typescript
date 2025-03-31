import { SyntheticEvent, useState } from "react";
import { Card } from "../common/card";
import { PlayerColor } from "../../types";

interface GameFormProps {
    onSubmit: (color: PlayerColor, maxPlayers: number) => void;
}
export const CreateGameForm = ({ onSubmit }: GameFormProps) => {
    const [formData, setFormData] = useState({
        maxPlayers: 2,
        color: PlayerColor.RED,
    });
    const handleSubmit = (e: SyntheticEvent) => {
        e.preventDefault();
        onSubmit(formData.color, formData.maxPlayers);
    };

    return (
        <Card header="Choose options" footer="Creating game">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center"
            >
                <div className="flex justify-between">
                    <label className="m-2 text-lg" htmlFor="maxPlayers">
                        Choose Lobby Size:
                    </label>
                    <select
                        className="m-2 p-2 rounded-xl bg-gray-800 border-1 border-gray-600"
                        id="maxPlayers"
                        name="maxPlayers"
                        value={formData.maxPlayers}
                        onChange={(e) => {
                            const selectedValue = parseInt(e.target.value, 10);
                            console.log(selectedValue);

                            setFormData((prev) => ({
                                ...prev,
                                maxPlayers: selectedValue,
                            }));
                        }}
                    >
                        <option value={2}>2 Players</option>
                        {/* <option value={3}>3 Players</option> */}
                        {/* <option value={4}>4 Players</option> */}
                    </select>
                </div>
                <div className="flex justify-between">
                    <label className="m-2 text-lg" htmlFor="color">
                        Choose Color:
                    </label>
                    <select
                        className="m-2 mr-auto p-2 rounded-xl bg-gray-800 border-1 border-gray-600"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={(e) => {
                            const selectedColor = e.target.value as PlayerColor;
                            setFormData((prev) => ({
                                ...prev,
                                color: selectedColor,
                            }));
                        }}
                    >
                        {[PlayerColor.RED, PlayerColor.BLUE].map((color, i) => (
                            <option key={i} value={color}>
                                {color[0].toUpperCase() + color.substring(1)}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit">Create Lobby</button>
            </form>
        </Card>
    );
};
