import { log } from "console";
import App from "./app";
import { appConfig } from "./config/configuration";
import { Logger } from "./utils/logger.util";

(async () => {
    try {
        const app = new App();
        await app.listen(() => {
            Logger.info(`App is running at port ${appConfig.port}`);
            Logger.info(`Press CTRL-C to stop\n`);
        });
    } catch (error) {
        error instanceof Error && Logger.error(`${JSON.stringify({ message: error.message, stack: error.stack})}`);
    }
})();