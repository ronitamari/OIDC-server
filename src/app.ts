import express, { Express } from "express";
import { appConfig } from "./config/configuration";
import passport from "passport";
import AuthController from "./controllers/auth.controller";
import corsMiddlewareOptions from "./utils/cors.util";
import cors from 'cors';
import PictureRouterController from './controllers/routers/protected-router.controller'
import { authenticateJWT } from "./utils/auth.middleware";

export default class App {
  app?: Express;
  port: number = Number(appConfig.port) || 3000;

  async init() {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(passport.initialize());
    app.set("port", this.port);
    app.use(cors(corsMiddlewareOptions()));
    app.use(express.text());
    
    // Router for authentication requests.
    app.use('/auth', AuthController.instance.router);
    // Middleware for all the routers that starts with '/api'.
    app.use(/^\/api\/(?!stream).*$/, authenticateJWT);
    
    // All the routers.
    app.use("/api", [
        PictureRouterController.router,
    ]);

    this.app = app;
  }

  async listen(callback: () => void) {
    await this.init();
    return this.app?.listen(this.app.get("port"), callback);
  }
}
