import Redis from "ioredis";
import mongoose from "mongoose";
import server from "./server";
import { config } from "./config";

const { MONGO_URI, PORT, HOST } = config;

const main = async () => {
    try {
        const redis = new Redis();

        redis.on("connect", () => console.log("Connected to Redis"));
        redis.on("error", (err) => console.error("Redis Error:", err));
        await mongoose.connect(MONGO_URI);

        server.listen(Number(PORT), HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error(err);
        return;
    }
};

main();
