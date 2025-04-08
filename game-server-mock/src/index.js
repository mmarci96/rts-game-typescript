import { config } from "./config.js";
import server from "./server/index.js";
const { PORT, HOST, NAMESPACE } = config;

const main = async () => {
    try {
        server.listen(PORT, HOST, () => {
            console.log(
                `Server is running on http://${HOST}:${PORT}/${NAMESPACE}`,
            );
        });
    } catch (err) {
        console.error(err);
        return;
    }
};
main();
