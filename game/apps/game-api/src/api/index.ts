import express from 'express';
import authRoutes from './routes/auth.routes';

const router = express.Router();

router.use('/auth', authRoutes)


export default router;
