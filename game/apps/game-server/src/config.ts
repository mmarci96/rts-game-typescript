import dotenv from "dotenv";

dotenv.config();

export const config = {
    PORT: process.env.PORT || "8080",
    HOST: process.env.HOST || "0.0.0.0",
    MONGO_URI:
        process.env.MONGO_URI || "mongodb://localhost:27017/rts-game-db-2",
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || undefined,
    REDIS_TLS: process.env.REDIS_TLS === "true",
};
