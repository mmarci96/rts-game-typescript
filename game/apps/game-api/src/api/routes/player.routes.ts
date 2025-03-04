import express, { Request, Response, NextFunction } from "express";
import {
    deletePlayerByUserId,
    getPlayerById,
} from "../../service/player.service";
import { Types } from "mongoose";
const router = express.Router();

router.get(
    "/:playerId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playerId } = req.params;
            const data = await getPlayerById(new Types.ObjectId(playerId));
            res.status(200).send(data);
        } catch (err) {
            next(err);
        }
    },
);

router.delete(
    "/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params;
            const { data, messege } = await deletePlayerByUserId(
                new Types.ObjectId(userId),
            );

            res.status(203).send({ data, messege });
        } catch (err) {
            next(err);
        }
    },
);

export default router;
