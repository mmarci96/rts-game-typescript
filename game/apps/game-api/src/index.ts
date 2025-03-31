import mongoose from "mongoose";
import app from "./app";

const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI as string;

const main = async () => {
    try {
        await mongoose.connect(mongo_uri);
        console.log("Connected to mongo: ", mongo_uri);

        app.listen(Number(port), "0.0.0.0", () => {
            console.log(`Listening: http://localhost:${port}`);
        });
    } catch (err) {
        console.error(err);
        return;
    }
};

main();
