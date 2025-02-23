import express, { Request, Response, NextFunction } from "express";
import { deletePlayerByUserId } from "../../service/player.service";
import { Types } from "mongoose";
const router = express.Router();

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
