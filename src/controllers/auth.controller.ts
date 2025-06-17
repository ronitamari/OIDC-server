import { Router, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import jwt from "jsonwebtoken";
import { log } from "console";
import GoogleStrategy from "passport-google-oauth20";
import { jwtConfig, passportConfig } from "../config/configuration";
import axios from "axios";

export default class AuthController {
  private static _instance: AuthController;

  public isAuthenticated: any;

  public router: Router;

  private constructor() {
    this.router = Router();

    this.router.get("/google", passport.authenticate("google", { scope: ['profile', 'email', 'openid'] }));
    this.router.get("/google/callback", passport.authenticate("google", { session: false }), this.successLogin);
    this.router.get("/logout", this.logout);

    this.initGoogleStrategy();
    this.initJwtStrategy();
  }

  logout = (req: any, res: any) => {
    
    req.logout(() => {
      console.log("in logout func");
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  };

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

    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?token=$${encodeURIComponent(
        token
      )}`
    );
  };

  private initGoogleStrategy = () => {
    passport.use(
      new GoogleStrategy.Strategy(
        {
          clientID: passportConfig.googleClientId,
          clientSecret: passportConfig.googleClientSecret,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email', 'openid'],
        },
        (accessToken, refreshToken, profile: any, done) => {
          return done(null, profile);
        }
      )
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user: any, done) => done(null, user));
  };

  private initJwtStrategy = () => {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: jwtConfig.secret,
        },
        async (payload, done) => {
          try {
              
              if (payload) return done(null, payload);
              return done(null, false);
            } catch (err) {
              console.log("using jwt strategy");
            return done(err);
          }
        }
      )
    );

    this.isAuthenticated = passport.authenticate('jwt', { session: false });
  };

  public static get instance() {
    if (!AuthController._instance) {
      AuthController._instance = new AuthController();
    }
    return AuthController._instance;
  }
}
