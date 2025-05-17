import { Player } from "@/types";
import { RxAvatar } from "react-icons/rx";
import { useUserContext } from "@/context/user-context";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Button,
} from "@heroui/react";
interface PlayerCardProps {
    player: Player;
}
export const PlayerCard = ({ player }: PlayerCardProps) => {
    const { userData } = useUserContext();
    const handleReady = async () => {
        if (player.userId !== userData.id) {
            return;
        }
        const res = await fetch("/api/players/" + player._id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isReady: true }),
        });
        const data = await res.json();
        console.log("Ready: ", data);
    };
    const handleLeave = async () => {
        if (player.userId !== userData.id) {
            return;
        }
        const res = await fetch("/api/players/" + player._id, {
            method: "DELETE",
        });
        const data = await res.json();
        console.log("Left: ", data);
    };

    return (
        <Card className="max-w-[400px] p-2 m-4 min-w-[320px]">
            <CardHeader className="flex gap-3">
                <RxAvatar color={player.color} size={36} />
                <div className="flex flex-col">
                    <p className="text-md">Name: {player.name}</p>
                    <p className="text-small text-default-500">
                        Color: {player.color}
                    </p>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <p>Status: {player.isReady ? "Ready" : "Waiting"}</p>
                {userData.id === player.userId && (
                    <div>
                        <Button onPress={handleReady} variant="flat">
                            Ready
                        </Button>
                        <Button
                            onPress={handleLeave}
                            variant="flat"
                            color="warning"
                        >
                            Leave
                        </Button>
                    </div>
                )}
            </CardBody>
            <Divider />
            <CardFooter>
                <p>Connected</p>
            </CardFooter>
        </Card>
    );
};
