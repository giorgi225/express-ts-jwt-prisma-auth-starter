import Send from "@utils/response.utils";
import { prisma } from "db";
import { Request, Response } from "express";

class UserController {
    // Retrieves user information based on the authenticated user
    static getUser = async (req: Request, res: Response) => {
        try {
            // Extract userId from the authenticated request
            const userId = (req as any).userId;

            // Fetch user data from the database
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            // If user not found, return a not found response
            if (!user) {
                return Send.notFound(res, {}, "User not found");
            }

            // Return the fetched user data
            return Send.success(res, { user });
        } catch (error) {
            // Handle any errors and send an error response
            console.error("Error fetching user info:", error);
            return Send.error(res, {}, "Internal server error");
        }
    };
}

export default UserController;