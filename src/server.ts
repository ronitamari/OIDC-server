import App from "./app";
import { appConfig } from "./config/configuration";

(async () => {
    try {
        const app = new App();
        await app.listen(() => {
            console.log(`App is running at port ${appConfig.port}`);
            console.log(`Press CTRL-C to stop\n`);
        });
    } catch (error) {
        error instanceof Error && console.log(`${JSON.stringify({ message: error.message, stack: error.stack})}`);
    }
})();