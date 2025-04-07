import server from "./server/index.js";
import { config } from "./config.js";

const { PORT, HOST } = config;

const main = async () => {
    try {
        server.listen(PORT, HOST, () => {
            console.log(`Server is running on http://${HOST}:${PORT}`);
        });
    } catch (err) {
        console.error(err);
        return;
    }
};
main();
