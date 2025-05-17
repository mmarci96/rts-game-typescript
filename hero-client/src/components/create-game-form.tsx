import React, { useState, useEffect, ChangeEvent, PointerEvent } from "react";
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
    RadioGroup,
    Radio,
    Chip,
} from "@heroui/react";

export const CreateGameForm = () => {
    const [error, setError] = useState("");
    const [gameMaps, setGameMaps] = useState<GameMap[]>([]);
    const [selectedMap, setSelectedMap] = useState<GameMap | null>(null);
    const [playerColor, setPlayerColor] = useState<PlayerColor | string>(
        PlayerColor.RED,
    );
    const navigate = useNavigate();

    const fetchGameMaps = async () => {
        const res = await fetch("/api/maps");
        const { data } = await res.json();
        setGameMaps(data);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

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
    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;

        setPlayerColor(color);
    };

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const mapId = e.target.value;
        const map: GameMap | undefined = gameMaps.find(
            (gameMap: GameMap) => gameMap._id === mapId,
        );
        if (!map) {
            console.error("WTF");
            return;
        }
        setSelectedMap(map);
    };
    useEffect(() => {
        fetchGameMaps();
    }, []);

    return (
        <Card
            fullWidth={true}
            className="w-full max-w-xl min-h-72 py-8 px-6 bg-background bg-opacity-60"
            isBlurred={true}
        >
            <CardHeader>
                <div className="flex flex-col items-center mb-auto mt-0">
                    <h2 className="text-2xl font-bold mr-auto">Create Game</h2>
                    <small className="text-default-500 italic mr-auto">
                        Choose from the options...
                    </small>
                </div>
            </CardHeader>
            <CardBody>
                <Form onSubmit={handleSubmit}>
                    <span className="flex gap-1">
                        <Select
                            label="Click to see seleciton..."
                            placeholder="Choose a map for the game!"
                            className="w-full min-w-[320px] text-lg"
                            startContent={<TbMapSearch size={32} />}
                            onChange={handleChange}
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
                    <span className="flex justify-between">
                        <RadioGroup
                            label="Select color"
                            orientation="horizontal"
                            className="mx-auto ml-1 "
                            onChange={handleColorChange}
                            defaultValue={PlayerColor.RED}
                        >
                            <Radio value={PlayerColor.RED}>Red</Radio>
                            <Radio value={PlayerColor.BLUE}>Blue</Radio>
                            <Radio isDisabled={true} value={PlayerColor.YELLOW}>
                                Yellow
                            </Radio>
                            <Radio isDisabled={true} value={PlayerColor.PURPLE}>
                                Purple
                            </Radio>
                        </RadioGroup>
                        <Button
                            className="rounded-xl w-[120px] ml-8 m-4 mr-0 hover:ring-2"
                            type="submit"
                            size="lg"
                            variant="faded"
                            isDisabled={selectedMap ? false : true}
                        >
                            Create game
                        </Button>
                    </span>
                </Form>
            </CardBody>
            <CardFooter>
                <p>Create a new lobby and find opponent</p>
                {error && (
                    <Chip variant="flat" color="warning">
                        {error.toString()}
                    </Chip>
                )}
            </CardFooter>
        </Card>
    );
};
