import { useApiRequest } from "@/hooks/use-apirequest";
import { HttpMethod, Player, PlayerColor } from "@/types";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
    Button,
    RadioGroup,
    Radio,
} from "@heroui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const JoinGameModal = ({ gameId }: { gameId: string }) => {
    const [playerColor, setPlayerColor] = useState<PlayerColor | string>(
        PlayerColor.RED,
    );
    const [takenColors, setTakenColors] = useState<PlayerColor[] | string[]>(
        [],
    );
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { fetchApiData } = useApiRequest();
    const navigate = useNavigate();

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setPlayerColor(color);
    };
    const handleJoin = async () => {
        const userId = window.localStorage.getItem("userId");
        const data = await fetchApiData(
            "/api/games/" + gameId,
            HttpMethod.PATCH,
            { userId, color: playerColor },
        );
        if (data) {
            navigate("/lobby/" + gameId);
        }
    };

    const getGameData = async (gameId: string) => {
        const res = await fetch("/api/games/" + gameId);
        const { data } = await res.json();
        const joinedPlayers = data.players as Player[];
        const taken = joinedPlayers.flatMap((p) => p.color);
        const available = [PlayerColor.RED, PlayerColor.BLUE];
        const remainingColors = available.filter(
            (color) => !taken.includes(color),
        );

        setTakenColors(taken);
        setPlayerColor(remainingColors[0]);
    };
    useEffect(() => {
        isOpen && getGameData(gameId);
    }, [isOpen]);

    return (
        <>
            <Button
                onPress={onOpen}
                color="success"
                variant="bordered"
                className="text-lg hover:ring-2 hover:bg-success-50 transition-transform ease-in duration-300"
            >
                Join
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Join Game</ModalHeader>
                            <ModalBody>
                                <p>
                                    Decide what color you want to play as and
                                    hit join!
                                </p>
                                <RadioGroup
                                    label="Select color"
                                    orientation="horizontal"
                                    className="mx-auto ml-1 "
                                    onChange={handleColorChange}
                                    value={playerColor}
                                >
                                    <Radio
                                        value={PlayerColor.RED}
                                        isDisabled={takenColors.includes(
                                            PlayerColor.RED,
                                        )}
                                    >
                                        Red
                                    </Radio>
                                    <Radio
                                        value={PlayerColor.BLUE}
                                        isDisabled={takenColors.includes(
                                            PlayerColor.BLUE,
                                        )}
                                    >
                                        Blue
                                    </Radio>
                                    <Radio
                                        value={PlayerColor.YELLOW}
                                        isDisabled={true}
                                    >
                                        Yellow
                                    </Radio>
                                    <Radio
                                        value={PlayerColor.PURPLE}
                                        isDisabled={true}
                                    >
                                        Purple
                                    </Radio>
                                </RadioGroup>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button color="primary" onPress={handleJoin}>
                                    Join
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
};
