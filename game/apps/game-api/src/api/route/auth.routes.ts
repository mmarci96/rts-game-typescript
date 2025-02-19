import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, password } = req.body;

        res.status(200).send({ data: username, password });
    } catch (err) {
        next(err);
    }
})


export default router;

