import Send from "@utils/response.utils";
import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";
import { doubleCsrf } from "csrf-csrf";

export const {
    generateToken,
    doubleCsrfProtection,
} = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET as string,  // CSRF secret key from environment
    cookieName: "csrf_token", // Cookie name for storing CSRF token
    cookieOptions: {
        httpOnly: true,  // Prevent JavaScript access
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "lax", // Protect against CSRF attacks
    },
    size: 64,  // Size of the CSRF token in bits
    ignoredMethods: ["GET", "HEAD", "OPTIONS"], // These methods don't require CSRF protection
    getTokenFromRequest: (req) => req.headers["x-csrf-token"], // Extract CSRF token from headers
});

class ValidationMiddleware {
    /**
     * Middleware to validate the request body using the provided Zod schema.
     * It formats and sends back detailed validation errors.
     */
    static validateBody(schema: ZodSchema) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);  // Validate the body against the schema
                next();  // If validation passes, move to the next middleware
            } catch (error) {
                if (error instanceof ZodError) {
                    // Format the validation errors for a clearer response
                    const formattedErrors: Record<string, string[]> = {};

                    error.errors.forEach((err) => {
                        const field = err.path.join(".");  // Get field name
                        if (!formattedErrors[field]) {
                            formattedErrors[field] = [];
                        }
                        formattedErrors[field].push(err.message);  // Add the error message
                    });

                    return Send.validationErrors(res, formattedErrors);  // Send formatted errors in response
                }

                // For any other errors, send a generic error response
                return Send.error(res, "Invalid request data");
            }
        };
    }

    /**
     * Middleware to validate CSRF token using the csrf-csrf package.
     * It ensures requests have a valid CSRF token to prevent CSRF attacks.
     */
    static validateCSRF = doubleCsrfProtection;
}

export default ValidationMiddleware;
