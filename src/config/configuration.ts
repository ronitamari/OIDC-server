import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
    port: process.env.PORT,
    corsWhitelist: process.env.CORS_WHITELIST?.split(',')
};

export const passportConfig = {
    googleClientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
    frontendUrl: process.env.FRONTEND_URL,
}

export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
}
