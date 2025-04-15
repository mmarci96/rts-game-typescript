import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { GameData, HttpMethod } from "@/types";
import { useApiRequest } from "@/hooks/use-apirequest";

export const GameTable = () => {
    const [gameLobbyList, setGameLobbyList] = useState<GameData[]>([]);
    const { fetchApiData, loading } = useApiRequest();

    useEffect(() => {
        const main = async (url: string, method: HttpMethod) => {
            const games: GameData[] = await fetchApiData(url, method, null);
            if (games) {
                setGameLobbyList(games);
                console.log("Games", games);
            }
        };
        main("/api/games", HttpMethod.GET);
    }, []);

    return (
        <Table
            aria-label="Games are waiting for you!"
            fullWidth
            isStriped
            classNames={{
                table: "min-w-lg",
            }}
        >
            <TableHeader>
                <TableColumn>
                    <h2 className="text-2xl font-bold ">Game</h2>
                </TableColumn>
                <TableColumn>
                    <h2 className="text-2xl font-bold ">Players</h2>
                </TableColumn>
                <TableColumn>
                    <h2 className="text-2xl font-bold ">Status</h2>
                </TableColumn>
                <TableColumn>
                    <h2 className="text-2xl font-bold ">Created</h2>
                </TableColumn>
                <TableColumn>
                    <h2 className="text-2xl font-bold ">Options</h2>
                </TableColumn>
            </TableHeader>
            <TableBody emptyContent="No games found." isLoading={loading}>
                {gameLobbyList.map((game) => (
                    <TableRow key={game._id}>
                        <TableCell className="text-sm text-blue">
                            {game.gameName}
                        </TableCell>
                        <TableCell>{game.maxPlayers}</TableCell>
                        <TableCell className="capitalize">
                            {game.status}
                        </TableCell>
                        <TableCell>
                            {new Date(game.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                            <Button
                                color="success"
                                variant="bordered"
                                className="text-lg hover:ring-2 font-semibold hover:bg-success-50 transition-transform ease-in duration-300"
                            >
                                Join
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
