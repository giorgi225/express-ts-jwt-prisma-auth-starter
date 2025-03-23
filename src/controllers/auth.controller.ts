import Send from "@utils/response.utils";
import { prisma } from "db";
import { Request, Response } from "express";
import authSchema from "validations/auth.schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import authConfig from "@config/auth.config";
import { generateToken } from "@middlewares/validation.middleware";
import { generateMillisecondsFromDuration, generateNumericCode } from "@utils/generate.utils";
import { Email_verification } from "@prisma/client";
import { getEmailVerificationExpirationDate } from "@config/email.config";
import EmailService from "services/email.services";

const emailService = new EmailService();

class AuthController {
    // Handles user login
    static login = async (req: Request, res: Response) => {
        // Destructure the request body into the expected fields
        const { email, password } = req.body as z.infer<typeof authSchema.login>;

        try {
            // Check if the email already exists in the database
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    Email_verification: true
                }
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

            // Check if the user's email is verified
            if (!user.Email_verification?.verified) {
                // Generate email verification code and expiration 
                const verificationCode = generateNumericCode();

                // Send Email verification code to user
                const emailRes = await emailService.sendEmailVerification({
                    code: verificationCode,
                    to: email
                })

                // If email sending fails, return as error response 
                if (!emailRes.ok) {
                    return Send.error(res, null, "There was an issue sending the verification email. Please try again later.");
                }

                // Only update the database if the email was sent successfully
                await prisma.email_verification.update({
                    where: { userId: user.id },
                    data: {
                        code: verificationCode,
                        verification_expiration: getEmailVerificationExpirationDate()
                    },
                });

                return Send.forbidden(res, {
                    email_verification_expiration: getEmailVerificationExpirationDate()
                }, "Your email is not verified. A verification code has been sent.");
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

            // Generate email verification code
            const verificationCode = generateNumericCode();

            // Send Email verification code to user
            const emailRes = await emailService.sendEmailVerification({
                code: verificationCode,
                to: email
            })

            // If email sending fails, return as error response and prevent user creation 
            if (!emailRes.ok) {
                return Send.error(res, null, "Can't process registration! there was an issue sending the verification email. Please try again later.")
            }

            // Hash the password before saving it in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user in the database with hashed password
            const newUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    Email_verification: {
                        create: {
                            code: verificationCode,
                            verification_expiration: getEmailVerificationExpirationDate()
                        }
                    }
                }
            });

            // Send success response with user data (excluding password)
            return Send.success(res, {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            }, "Registration successful. Please verify your email.");

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

    // Verifies the user's email by validating the provided verification code
    static verifyEmail = async (req: Request, res: Response) => {
        // Destructure the request body into the expected fields (email and code)
        const { email, code } = req.body as z.infer<typeof authSchema.verifyEmail>;

        try {
            // 1. Check if the user email exists in the database
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    Email_verification: true // Include email verification details
                }
            });
            

            // If the user is not found, return a "Not Found" response
            if (!user) {
                return Send.notFound(res, null, "User with the given email not found.");
            }

            const emailVerification = user.Email_verification as Email_verification;

            // 2. Check if the user has already verified their email
            if (emailVerification.verified) {
                return Send.conflict(res, null, "Your email has already been verified.");
            }

            // 3. Check if the provided code matches the code stored in the database
            if (parseInt(code) !== emailVerification.code) {
                return Send.error(res, null, "The verification code is invalid!");
            }

            // 4. Check if the verification code has expired
            if (new Date() > new Date(emailVerification.verification_expiration as Date)) {
                return Send.error(res, null, "The verification code has expired. Please request a new one.");
            }

            // 5. Mark the email as verified in the database (clear the code and expiration)
            await prisma.user.update({
                where: { email },
                data: {
                    Email_verification: {
                        update: {
                            code: null, // Remove the verification code
                            verified: true, // Mark the email as verified
                            verification_expiration: null, // Remove expiration time
                            verified_at: new Date(), // Set the time of verification
                        }
                    }
                }
            });

            // 6. Return a success response once email is verified
            return Send.success(res, null, "Your email has been successfully verified.");

        } catch (error) {
            console.error("Email verification failed:", error);
            return Send.error(res, null, "An error occurred while verifying the email. Please try again.");
        }
    }

    // Sends an email verification code to the user
    static sendEmailVerification = async (req: Request, res: Response) => {
        // Destructure the request body into the expected fields (email)
        const { email } = req.body as z.infer<typeof authSchema.sendEmailVerification>;

        try {
            // 1. Check if the user email exists in the database
            const user = await prisma.user.findUnique({
                where: { email },
                include: {
                    Email_verification: true // Include email verification details
                }
            });

            // If the user is not found, return a "Not Found" response
            if (!user) {
                return Send.notFound(res, null, "User with the given email not found.");
            }

            const emailVerification = user.Email_verification as Email_verification;

            // 2. Check if the user has already verified their email
            if (emailVerification.verified) {
                return Send.conflict(res, null, "Your email has already been verified.");
            }

            // 3. Generate a 6-digit verification code for email verification
            const verificationCode = generateNumericCode();

            // Send the verification code to the user via email
            const emailRes = await emailService.sendEmailVerification({
                code: verificationCode,
                to: email
            });

            // If email sending fails, return an error response
            if (!emailRes.ok) {
                return Send.error(res, null, "There was an issue sending the verification email. Please try again later.");
            }

            // 4. Only update the database if the email was sent successfully
            await prisma.email_verification.update({
                where: { userId: user.id },
                data: {
                    code: verificationCode, // Store the verification code
                    verification_expiration: getEmailVerificationExpirationDate(), // Set the expiration time for the verification code
                },
            });

            // 5. Return a success response once the email is sent
            return Send.success(res, null, "Code has been sent successfully.");

        } catch (error) {
            console.error("Email verification failed:", error);
            return Send.error(res, null, "An error occurred while verifying the email. Please try again.");
        }
    }
}

export default AuthController;