import { Player } from "@/types";
import { RxAvatar } from "react-icons/rx";
import { Card, CardHeader, CardBody, CardFooter, Divider } from "@heroui/react";
interface PlayerCardProps {
    player: Player;
}
export const PlayerCard = ({ player }: PlayerCardProps) => {
    console.log(player);

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
            </CardBody>
            <Divider />
            <CardFooter>
                <p>Connected</p>
            </CardFooter>
        </Card>
    );
};
