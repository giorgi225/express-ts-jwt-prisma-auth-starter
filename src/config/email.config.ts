import { generateMillisecondsFromDuration } from "@utils/generate.utils"; // Utility function to convert duration string to milliseconds
import { addMilliseconds } from "date-fns"; // Function to add milliseconds to a date
import { bool, cleanEnv, email, num, port, str } from "envalid"; // Environment variable validation functions

// Clean and validate environment variables related to email configuration
const emailConfig = cleanEnv(process.env, {
    EMAIL_HOST: str(), // The email host (e.g., SMTP server)
    EMAIL_PORT: port(), // The port for the email server (e.g., 587 for SMTP)
    EMAIL_SECURE: bool(), // Boolean value indicating whether to use secure connections (TLS/SSL)
    EMAIL_USER: str(), // The email user for authentication
    EMAIL_PASS: str(), // The password for the email user for authentication
    EMAIL_VERIFICATION_EXPIRATION: str(), // The expiration duration for the email verification code (e.g., "15m", "1h", etc.)
});

// Calculate the email verification expiration date by adding the specified duration to the current date
export const getEmailVerificationExpirationDate = (): Date => {
    return addMilliseconds(
        new Date(), // Current time (now)
        generateMillisecondsFromDuration(emailConfig.EMAIL_VERIFICATION_EXPIRATION) // Convert the duration to milliseconds and add it to the current time
    );
}

export default emailConfig; // Export the validated email configuration object