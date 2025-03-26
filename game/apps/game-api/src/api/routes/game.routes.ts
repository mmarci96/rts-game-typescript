import express, { Request, Response, NextFunction } from "express";
import {
    createGame,
    deleteGame,
    getGameById,
    getGamesToJoin,
    joinGame,
    startGame,
} from "../../service/game.service";

const router = express.Router();

router.get(
    "/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const game = await getGameById(gameId);
            res.status(200).send({ data: game });
        } catch (err) {
            next(err);
        }
    },
);

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const games = await getGamesToJoin();
        res.status(200).send({ data: games });
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, mapId, color, maxPlayers } = req.body;

        const game = await createGame(
            userId,
            mapId,
            color,
            parseInt(maxPlayers),
        );

        res.status(201).send({ data: game });
    } catch (err) {
        console.log(err);

        next(err);
    }
});

router.patch(
    "/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, color } = req.body;
            const { gameId } = req.params;
            const game = await joinGame(userId, color, gameId);
            res.status(202).send({ data: game });
        } catch (err) {
            console.error("Join game route:", err);

            next(err);
        }
    },
);

router.delete(
    "/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            await deleteGame(gameId);

            res.status(203).send({
                data: { messege: "Succesfully deleted game!" },
            });
        } catch (err) {
            next(err);
        }
    },
);

router.patch(
    "/start/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            const gameStatus = await startGame(gameId);
            res.status(202).send({ data: gameStatus });
        } catch (err) {
            next(err);
        }
    },
);

export default router;
