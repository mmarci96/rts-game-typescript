import express, { Request, Response, NextFunction } from 'express';
import { createUser, loginUser } from '../../service/user.service';

const router = express.Router();

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser(email, password)

        res.status(200).send({ data: user });
    } catch (err) {
        next(err);
    }
})

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, username, password } = req.body;
        const user = await createUser(email, username, password);

        res.status(201).send({ data: user });
    } catch (err) {
        next(err);
    }
})


export default router;

