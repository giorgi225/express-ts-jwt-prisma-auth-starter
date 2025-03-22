/**
 * Converts a duration string (e.g., "15m", "2h", "3d") to milliseconds.
 * 
 * The function parses the input string to extract a numeric value and a time unit (minutes, hours, or days).
 * Based on the extracted unit, it converts the value into the corresponding milliseconds.
 * 
 * @param {string} duration - The duration string in the format of a number followed by a time unit:
 *                             "m" for minutes, "h" for hours, or "d" for days.
 *                             Example inputs: "15m", "2h", "3d"
 * 
 * @returns {number} - The equivalent duration in milliseconds.
 * 
 * @throws {Error} - Throws an error if the format is invalid or the unit is unsupported.
 */
export function generateMillisecondsFromDuration(duration: string): number {
    // Match numeric value followed by "m" for minutes, "h" for hours, or "d" for days
    const match = duration.match(/^(\d+)([mhd])$/i);  // Regex to capture value and unit (m, h, or d)

    // If the format doesn't match (e.g., user doesn't use correct unit or provides invalid string)
    if (!match) {
        throw new Error('Invalid duration format. Please use numbers followed by "m" for minutes, "h" for hours, or "d" for days. Example: "15m", "2h", "3d".');
    }

    const value = parseInt(match[1]);  // The numeric value (e.g., 15 from "15m")
    const unit = match[2].toLowerCase();  // The unit (e.g., "m" from "15m", which represents minutes)

    // Convert the unit to milliseconds
    switch (unit) {
        case 'm':  // "m" is for minutes
            return value * 60 * 1000;  // Convert minutes to milliseconds
        case 'h':  // "h" is for hours
            return value * 60 * 60 * 1000;  // Convert hours to milliseconds
        case 'd':  // "d" is for days
            return value * 24 * 60 * 60 * 1000;  // Convert days to milliseconds
        default:
            throw new Error('Invalid duration unit. Supported units are "m" (minutes), "h" (hours), or "d" (days).');
    }
}