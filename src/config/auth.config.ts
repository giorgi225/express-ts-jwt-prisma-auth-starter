import { cleanEnv, str } from "envalid";

// Validate environment variables for authentication configuration (JWT secrets and expiration times)
const authConfig = cleanEnv(process.env, {
    AUTH_SECRET: str(),                      // Secret key for signing JWT access tokens
    AUTH_SECRET_EXPIRES_IN: str(),           // Expiration time for the JWT access token (e.g., "15m")
    AUTH_REFRESH_SECRET: str(),              // Secret key for signing JWT refresh tokens
    AUTH_REFRESH_SECRET_EXPIRES_IN: str(),   // Expiration time for the JWT refresh token (e.g., "24h")
})

export default authConfig;