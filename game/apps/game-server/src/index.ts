import mongoose from "mongoose";
import server from "./server";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT || "8080";
const HOST = process.env.HOST || "0.0.0.0";
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://localhost:27017/rts-game-db-2";

const main = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        server.listen(parseInt(PORT), HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error(err);
        return;
    }
};

main();
