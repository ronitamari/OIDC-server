import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import GoogleStrategy from "passport-google-oauth20";
import { jwtConfig, passportConfig } from "../config/configuration";

/**
 * AuthController handles all authentication-related routing using PassportJS with Google OAuth.
 *
 * It defines login, logout, and callback routes and integrates the Google OAuth strategy.
 * The controller is implemented as a singleton to ensure consistent behavior across the app.
 */
export default class AuthController {
  private static _instance: AuthController;

  public router: Router;

  private constructor() {
    this.router = Router();
    // Route to initiate Google OAuth login
    this.router.get(
      "/google",
      passport.authenticate("google", { scope: ["profile", "email", "openid"] })
    );
    // Google OAuth callback route after login success
    this.router.get(
      "/google/callback",
      passport.authenticate("google", { session: false }),
      this.successLogin
    );
    // Route to log out the user

    this.router.get("/logout", this.logout);

    this.initGoogleStrategy();
  }

  /**
   * Handles user logout by calling Passport's `logout()` and redirecting to the frontend login page.
   */
  logout = (req: any, res: any) => {
    req.logout(() => {
      console.log("in logout func");
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  };

  /**
   * Handles successful login after the Google OAuth callback.
   *
   * Creates a signed JWT from the user's profile and redirects to the frontend with the token in the URL.
   */
  successLogin = (req: any, res: any) => {
    const user = {
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.emails?.[0]?.value,
      photo: req.user.photos?.[0]?.value,
    };

    const token = jwt.sign(user, jwtConfig.secret, {
      expiresIn: "1h",
    });
    console.log("first token: " + token);

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=$${token}`);
  };

  /**
   * Initializes the Google OAuth strategy for PassportJS.
   *
   * Configures Passport to handle Google authentication and session serialization.
   */
  private initGoogleStrategy = () => {
    passport.use(
      new GoogleStrategy.Strategy(
        {
          clientID: passportConfig.googleClientId,
          clientSecret: passportConfig.googleClientSecret,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          scope: ["profile", "email", "openid"],
        },
        (accessToken, refreshToken, profile: any, done) => {
          return done(null, profile);
        }
      )
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user: any, done) => done(null, user));
  };

  /**
   * Returns the singleton instance of AuthController.
   */
  public static get instance() {
    if (!AuthController._instance) {
      AuthController._instance = new AuthController();
    }
    return AuthController._instance;
  }
}
