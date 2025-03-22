import BaseRouter, { RouteConfig } from "./router";
import AuthMiddleware from "@middlewares/auth.middleware";
import UserController from "@controllers/user.controller";
import ValidationMiddleware from "@middlewares/validation.middleware";

class UserRoutes extends BaseRouter {
    protected routes(): RouteConfig[] {
        return [
            {
                // Route to get the authenticated user's information
                method: "get",
                path: "/info",  // Endpoint: api/user/info
                middlewares: [
                    AuthMiddleware.authenticateUser  // Ensure the user is authenticated before retrieving info
                ],
                handler: UserController.getUser
            },
        ]
    }
}

export default new UserRoutes().router;