import cors from 'cors';
import { appConfig } from '../config/configuration';

/* This function is used to create a set of rules for Cross-Origin Resource Sharing (CORS),
 * defining which origins are allowed to access the server's resources.
*/
const corsMiddlewareOptions = () => {
    const options: cors.CorsOptions = {
        origin: (origin: any, callback: Function) => {
            const whitelist = appConfig.corsWhitelist || ['http://localhost:4200'];
            if (!origin || whitelist.includes(origin)) {
                console.log("origin: " + origin);
                callback(null, origin);
            } else {
                console.log("wrong cors...");
                
                callback(new Error(`Not allowed by CORS, origin: ${origin}`));
            }
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Pragma', 'Cache-Control'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    };
    return options;
};


export default corsMiddlewareOptions;