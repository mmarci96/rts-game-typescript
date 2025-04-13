import React, { useState, useEffect } from "react";
import { TbMapSearch, TbMapStar } from "react-icons/tb";
import { PlayerColor, GameMap } from "@/types";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Form,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    SelectItem,
    Select,
} from "@heroui/react";

export const CreateGameForm = () => {
    const [error, setError] = useState("");
    const [gameMaps, setGameMaps] = useState<GameMap[]>([]);
    const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
    const [playerColor, setPlayerColor] = useState(PlayerColor.RED);
    const navigate = useNavigate();

    const fetchGameMaps = async () => {
        const res = await fetch("/api/maps");
        const { data } = await res.json();
        setGameMaps(data);
    };

    const handleSubmit = async () => {
        const userId = window.localStorage.getItem("userId");
        const requestData = {
            color: playerColor,
            maxPlayers: 2,
            mapId: selectedMap?._id,
            userId,
        };
        try {
            const res = await fetch("/api/games", {
                method: "POST",
                body: JSON.stringify(requestData),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const { data } = await res.json();
            console.log(data.game._id);
            if (data.game._id) {
                navigate(`/lobby/${data.game._id}`);
            }
        } catch (err) {
            setError(err as string);
        }
    };

    useEffect(() => {
        fetchGameMaps();
    }, []);

    return (
        <Card fullWidth={true} className="w-full max-w-lg">
            <CardHeader>CreateGame</CardHeader>
            <CardBody>
                <Form onSubmit={handleSubmit}>
                    <span className="flex gap-1">
                        <Select
                            label="Click to see seleciton..."
                            placeholder="Choose a map for the game!"
                            className="w-full min-w-[320px] text-lg"
                            startContent={<TbMapSearch size={32} />}
                        >
                            {gameMaps?.map((gameMap) => (
                                <SelectItem
                                    key={gameMap._id}
                                    startContent={<TbMapStar />}
                                    className="hover:font-semibold"
                                >
                                    {gameMap.type + gameMap.size}
                                </SelectItem>
                            ))}
                        </Select>
                        <Select
                            isDisabled
                            className="ml-auto mr-1 w-[160px]"
                            defaultSelectedKeys={"2"}
                            label="Player limit"
                            placeholder="Coming soon..."
                        >
                            <SelectItem key={"2"}>2 Players </SelectItem>
                        </Select>
                    </span>
                    <Button type="submit" variant="bordered">
                        Create game
                    </Button>
                </Form>
            </CardBody>
            <CardFooter>
                <p>Create a new lobby and find opponent</p>
            </CardFooter>
        </Card>
    );
};
