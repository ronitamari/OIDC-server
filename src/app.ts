import express, { Express } from "express";
import { appConfig } from "./config/configuration";
import helmet from "helmet";
import { morganMiddleware } from "./utils/logger.util";
import passport from "passport";
import AuthController from "./controllers/auth.controller";
import corsMiddlewareOptions from "./utils/cors.util";
import cors from 'cors';

export default class App {
  app?: Express;
  port: number = Number(appConfig.port) || 3000;

  async init() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(passport.initialize());
    app.set("port", this.port);
    app.use(morganMiddleware);
    app.use(helmet());
    app.use(cors(corsMiddlewareOptions()));
    app.use(express.text());
    
    app.use('/auth', AuthController.instance.router);
    app.use(/^\/api\/(?!stream).*$/, AuthController.instance.isAuthenticated);
    
    // app.use("/api", [
    //     userRouterController.router,
    //     certificateRouterController.router,
    // ]);

    this.app = app;
  }

  async listen(callback: () => void) {
    await this.init();
    return this.app?.listen(this.app.get("port"), callback);
  }
}
