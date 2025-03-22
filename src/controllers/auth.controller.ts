import Send from "@utils/response.utils";
import { prisma } from "db";
import { Request, Response } from "express";
import authSchema from "validations/auth.schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import authConfig from "@config/auth.config";
import { generateToken } from "@middlewares/validation.middleware";
import { generateMillisecondsFromDuration } from "@utils/generate.utils";

class AuthController {
    // Handles user login
    static login = async (req: Request, res: Response) => {
        // Destructure the request body into the expected fields
        const { email, password } = req.body as z.infer<typeof authSchema.login>;

        try {
            // Check if the email already exists in the database
            const user = await prisma.user.findUnique({
                where: { email }
            });

            // If user does not exist, return an error
            if (!user) {
                return Send.unauthorized(res, {}, "Invalid credentials");
            }

            // Validate password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return Send.unauthorized(res, null, "Invalid credentials.");
            }

            // Generate JWT tokens (access and refresh tokens)
            const accessToken = jwt.sign(
                { userId: user.id },
                authConfig.AUTH_SECRET,
                { expiresIn: authConfig.AUTH_SECRET_EXPIRES_IN as any }
            );

            const refreshToken = jwt.sign(
                { userId: user.id },
                authConfig.AUTH_REFRESH_SECRET,
                { expiresIn: authConfig.AUTH_REFRESH_SECRET_EXPIRES_IN as any }
            );

            // Optionally store the refresh token in the database
            await prisma.user.update({
                where: { email },
                data: { refreshToken }
            });

            // Set tokens in HttpOnly cookies
            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: generateMillisecondsFromDuration(authConfig.AUTH_SECRET_EXPIRES_IN),
                sameSite: "lax"
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: generateMillisecondsFromDuration(authConfig.AUTH_REFRESH_SECRET_EXPIRES_IN),
                sameSite: "lax"
            });

            // Return user data without sending tokens in response body
            return Send.success(res, {
                id: user.id,
                username: user.username,
                email: user.email
            });

        } catch (error) {
            // Handle unexpected errors
            console.error("Login Failed:", error);
            return Send.error(res, null, "Login failed.");
        }
    }

    // Handles user registration
    static register = async (req: Request, res: Response) => {
        // Destructure the request body into the expected fields
        const { username, email, password, password_confirmation } = req.body as z.infer<typeof authSchema.register>;

        try {
            // Check if the email already exists in the database
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                return Send.conflict(res, null, "Email is already in use.");
            }

            // Hash the password before saving it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user in the database with hashed password
            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                }
            });

            // Send success response with user data (excluding password)
            return Send.success(res, {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }, "Registration successful.");

        } catch (error) {
            // Handle errors like DB or network issues
            console.error("Registration failed:", error);
            return Send.error(res, null, "Registration failed.");
        }
    }

    // Handles user logout by clearing cookies and optional DB cleanup
    static logout = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.userId;  // User ID from authentication middleware

            if (userId) {
                // Optionally remove the refresh token from the database
                await prisma.user.update({
                    where: { id: userId },
                    data: { refreshToken: null }
                });
            }

            // Clear access token, refresh token, and csrf-token cookies
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.clearCookie("csrf-token");

            // Return a success response
            return Send.success(res, null, "Logged out successfully.");
        } catch (error) {
            // Handle errors during logout
            console.error("Logout failed:", error);
            return Send.error(res, null, "Logout failed.");
        }
    }

    // Refresh access token using a valid refresh token
    static refreshToken = async (req: Request, res: Response) => {
        try {
            // Get userId from middleware & refreshToken from cookies
            const userId = (req as any).userId;
            const refreshToken = req.cookies.refreshToken;

            // Validate refresh token
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
                return Send.unauthorized(res, "Invalid refresh token");
            }

            // Generate a new access token
            const newAccessToken = jwt.sign(
                { userId: user.id },
                authConfig.AUTH_SECRET,
                { expiresIn: authConfig.AUTH_SECRET_EXPIRES_IN as any }
            );
            // Set the new access token in cookies
            res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: true,
                maxAge: generateMillisecondsFromDuration(authConfig.AUTH_SECRET_EXPIRES_IN),
                sameSite: "lax"
            });

            // Return a success response
            return Send.success(res, { message: "Access token refreshed successfully" });
        } catch (error) {
            // Handle errors during refresh
            console.error("Refresh Token failed:", error);
            return Send.error(res, null, "Failed to refresh token");
        }
    }

    // Generates CSRF token for protection
    static getCSRF = (req: Request, res: Response) => {
        try {
            const csrfToken = generateToken(req, res);
            return Send.success(res, { csrf: csrfToken })
        } catch (error) {
            console.error("Failed to generate CSRF token:", error);
            return Send.error(res, "Failed to generate CSRF token");
        }
    };
}

export default AuthController;