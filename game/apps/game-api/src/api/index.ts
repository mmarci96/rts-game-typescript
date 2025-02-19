import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';

const router = express.Router();

router.use('/auth', authRoutes)


export default router;
