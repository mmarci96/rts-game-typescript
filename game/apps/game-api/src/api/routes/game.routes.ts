import express, { Request, Response, NextFunction } from "express";
import {
    createGame,
    deleteGame,
    getGamesToJoin,
    joinGame,
    startGame,
} from "../../service/game.service";
import { Types } from "mongoose";

const router = express.Router();

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
        next(err);
    }
});

router.patch(
    "/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, color } = req.body;
            const { gameId } = req.params;
            const game = await joinGame(
                userId,
                color,
                new Types.ObjectId(gameId),
            );
            res.status(202).send({ data: game });
        } catch (err) {
            next(err);
        }
    },
);

router.delete(
    "/:gameId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { gameId } = req.params;
            await deleteGame(new Types.ObjectId(gameId));

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
            const gameStatus = await startGame(new Types.ObjectId(gameId));
            res.status(202).send({ data: gameStatus });
        } catch (err) {
            next(err);
        }
    },
);

export default router;
