import express, { Request, Response, NextFunction } from "express";
import { getMapById, getMaps } from "../../service/map.service";
import { Types } from "mongoose";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const maps = await getMaps();
        res.status(200).send({ data: maps });
    } catch (err) {
        next(err);
    }
});

router.get(
    "/:mapId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { mapId } = req.params;
            const map = await getMapById(new Types.ObjectId(mapId));
            res.status(200).send({ data: map });
        } catch (err) {
            next(err);
        }
    },
);

export default router;
