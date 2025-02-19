import express from "express";
import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/games", gameRoutes);

export default router;
