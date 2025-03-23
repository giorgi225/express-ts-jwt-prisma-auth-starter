import AuthController from "@controllers/auth.controller";
import BaseRouter, { RouteConfig } from "./router";
import ValidationMiddleware from "@middlewares/validation.middleware";
import AuthMiddleware from "@middlewares/auth.middleware";
import authSchema from "validations/auth.schema";

class AuthRouter extends BaseRouter {
    /**
     * Defines the routes for authentication operations.
     * These include login, registration, CSRF protection, logout, and token refresh.
     */
    protected routes(): RouteConfig[] {
        return [
            {
                // Route to login the user
                method: "post",
                path: "/login",  // Endpoint: api/auth/login
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.login),  // Validate login request body
                ],
                handler: AuthController.login
            },
            {
                // Route to register a new user
                method: "post",
                path: "/register",  // Endpoint: api/auth/register
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.register)  // Validate registration request body
                ],
                handler: AuthController.register
            },
            {
                // Route to logout the user
                method: "post",
                path: "/logout",  // Endpoint: api/auth/logout
                middlewares: [
                    AuthMiddleware.authenticateUser  // Ensure the user is authenticated before logging out
                ],
                handler: AuthController.logout
            },
            {
                // Route to refresh the access token
                method: "post",
                path: "/refresh-token",  // Endpoint: api/auth/refresh-token
                middlewares: [
                    AuthMiddleware.refreshTokenValidation  // Validate the refresh token before issuing a new access token
                ],
                handler: AuthController.refreshToken
            },
            {
                // Route to get CSRF token
                method: "get",
                path: "/get-csrf",  // Endpoint: api/auth/get-csrf
                handler: AuthController.getCSRF
            },
            {
                // Route to verify email
                method: "post",
                path: "/verify-email",  // Endpoint: api/auth/verify-email
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.verifyEmail)
                ],
                handler: AuthController.verifyEmail
            },
            {
                // Route to send email verification 6 digit code
                method: "post",
                path: "/send-email-verification",  // Endpoint: api/auth/send-email-verification
                middlewares: [
                    ValidationMiddleware.validateBody(authSchema.sendEmailVerification)
                ],
                handler: AuthController.sendEmailVerification
            },
        ]
    }
}

export default new AuthRouter().router;