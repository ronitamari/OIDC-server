import { Router } from "express";
import pictureController from "../picture.controller";
import AuthController from "../auth.controller";
import { authenticateJWT } from "../../utils/auth.middleware";

/**
 * PictureRouterController
 *
 * This class defines the routing logic for picture-related API endpoints.
 * Specifically, it exposes a protected GET endpoint that allows authenticated
 * users to retrieve a picture.
 *
 * The actual picture-handling logic is delegated to `pictureController.readPicture`.
 */
class PictureRouterController {
  router: Router;

  constructor() {
    this.router = Router();

    // GET /get-picture → handled by pictureController.readPicture
    this.router.get("/get-picture", pictureController.readPicture);
  }
}

export default new PictureRouterController();
