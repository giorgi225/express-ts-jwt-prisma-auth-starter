import authConfig from "@config/auth.config";
import Send from "@utils/response.utils";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface DecodedToken {
    userId: number;
}

class AuthMiddleware {
    /**
     * Middleware to authenticate the user based on the access token stored in the HttpOnly cookie.
     * This middleware will verify the access token and attach the user information to the request object.
     */
    static authenticateUser = (req: Request, res: Response, next: NextFunction) => {
        // Extract access token from the HttpOnly cookie
        const token = req.cookies.accessToken;

        // Return error token is missing
        if (!token) {
            return Send.unauthorized(res, null);
        }

        try {
            // Verify token using the secret key
            const decodedToken = jwt.verify(token, authConfig.AUTH_SECRET) as DecodedToken;

            // Attach userId to the request object
            (req as any).userId = decodedToken.userId; // Attach userId to the request object

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            // If verification fails, return error
            console.error("Authentication failed:", error);  // Log error for debugging
            return Send.unauthorized(res, null);  // 401 Unauthorized
        }
    };

    /**
     * Middleware to validate the refresh token from the HttpOnly cookie.
     * Verifies the token and attaches user information to the request.
     */
    static refreshTokenValidation = (req: Request, res: Response, next: NextFunction) => {
        // Extract refresh token from the HttpOnly cookie
        const refreshToken = req.cookies.refreshToken;

        // Return error if refresh token is missing
        if (!refreshToken) {
            return Send.unauthorized(res, { message: "No refresh token provided" });
        }

        try {
            // Verify the refresh token using the refresh secret
            const decodedToken = jwt.verify(refreshToken, authConfig.AUTH_REFRESH_SECRET) as { userId: number };

            // Attach userId to the request object
            (req as any).userId = decodedToken.userId;

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            // Handle errors if token is invalid or expired
            console.error("Refresh Token authentication failed:", error);  // Log error for debugging
            return Send.unauthorized(res, { message: "Invalid or expired refresh token" });  // 401 Unauthorized
        }
    };
}

export default AuthMiddleware;