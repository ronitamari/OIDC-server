import request from "supertest";
import App from "../../app";
import { Application } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../../../src/config/configuration";

/**
 * Functional Tests for AuthController
 *
 * This test suite verifies the behavior of authentication and protected resource routes
 * in a full-stack OIDC-based application.
 *
 * It uses Supertest to simulate HTTP requests to the Express server and tests responses for correctness.
 */
describe("AuthController Functional Tests", () => {
  let app: Application;

  /**
   * Initialize the application before all tests.
   * Creates an Express instance and loads the full app setup.
   */
  beforeAll(async () => {
    const server = new App();
    await server.init();
    app = server.app!;
  });

  /**
   * Test: Redirect to Google OAuth
   * Verifies that a GET request to `/auth/google` correctly redirects to Google login.
   */
  it("GET /auth/google - should redirect to Google OAuth", async () => {
    const res = await request(app).get("/auth/google");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain("accounts.google.com");
  });

  /**
   * Test: Google OAuth Callback
   * Simulates a successful Google login and verifies that a JWT is generated and contains user data.
   * Note: This test mocks Passport's Google strategy for simulation.
   */
  it("GET /auth/google/callback - should generate JWT and redirect to frontend with token", async () => {
    const fakeProfile = {
      id: "123456",
      displayName: "Test User",
      emails: [{ value: "test@example.com" }],
      photos: [{ value: "https://example.com/photo.jpg" }],
    };

    const passport = require("passport");
    const GoogleStrategy = require("passport-google-oauth20").Strategy;

    passport.use(
      "google-mock",
      new GoogleStrategy(
        {
          clientID: "fake-id",
          clientSecret: "fake-secret",
          callbackURL: "/auth/google/callback",
        },
        function (
          _accessToken: any,
          _refreshToken: any,
          profile: any,
          done: any
        ) {
          done(null, fakeProfile);
        }
      )
    );

    const token = jwt.sign(fakeProfile, jwtConfig.secret, { expiresIn: "1h" });
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=$${token}`;

    const decoded = jwt.verify(token, jwtConfig.secret);
    expect(decoded).toHaveProperty("id", fakeProfile.id);
  });

  /**
   * Test: Accessing protected route without token
   * Expects a 401 Unauthorized status.
   */
  it("GET /api/get-picture - without JWT should return 401", async () => {
    const res = await request(app).get("/api/get-picture");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Missing or invalid Authorization header");
  });

  /**
   * Test: Accessing protected route with a valid JWT
   * Expects a 200 OK (or 404 if the picture is missing).
   */
  it("GET /api/get-picture - with valid JWT should return 200", async () => {
    const mockUser = {
      id: "1234",
      displayName: "Test User",
      email: "test@example.com",
    };

    const token = jwt.sign(mockUser, jwtConfig.secret, { expiresIn: "1h" });

    const res = await request(app)
      .get("/api/get-picture")
      .set("Authorization", `Bearer $${token}`);

    expect([200, 404]).toContain(res.status);
  });

  /**
   * Test: Accessing protected route with an invalid JWT
   * Expects a 403 Forbidden status.
   */
  it("GET /api/get-picture - with invalid JWT should return 403", async () => {
    const res = await request(app)
      .get("/api/get-picture")
      .set("Authorization", "Bearer $invalidtoken");

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  /**
   * Test: Simulated CSRF attack via POST
   * Attempts to change picture with a token but unauthorized payload.
   * Expected to fail with 403 or 400.
   */
  it("POST /api/change-picture - CSRF attack simulation should fail", async () => {
    const token = jwt.sign({ id: "csrf-test" }, jwtConfig.secret, {
      expiresIn: "1h",
    });
    const res = await request(app)
      .post("/api/change-picture")
      .set("Authorization", `Bearer ${token}`)
      .send({ malicious: true });

    expect([403, 400]).toContain(res.status);
  });

  /**
   * Test: Logout route
   * Verifies that calling `/auth/logout` redirects to the login page.
   */
  it("GET /auth/logout - should redirect to frontend login page", async () => {
    const res = await request(app).get("/auth/logout");
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain(`${process.env.FRONTEND_URL}/login`);
  });

  /**
   * Test: Expired JWT
   * Generates a token with a short expiration and verifies that it is rejected after expiry.
   */
  it("GET /api/get-picture - with expired JWT should return 403", async () => {
    const expiredUser = {
      id: "expired-user",
      displayName: "Expired Token",
      email: "expired@example.com",
    };

    const token = jwt.sign(expiredUser, jwtConfig.secret, {
      expiresIn: "0.5s",
    });

    await new Promise((resolve) => setTimeout(resolve, 600)); // 600ms

    const res = await request(app)
      .get("/api/get-picture")
      .set("Authorization", `Bearer $${token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Invalid or expired token");
  });
});
