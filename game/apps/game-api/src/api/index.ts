import express from "express";
import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import mapRoutes from "./routes/map.routes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/games", gameRoutes);
router.use("/maps", mapRoutes);

export default router;
