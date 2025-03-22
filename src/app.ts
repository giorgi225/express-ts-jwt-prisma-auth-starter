import express, { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "@routes/auth.routes";
import appConfig from "@config/app.config";
import userRoutes from "@routes/user.routes";
import ValidationMiddleware from "@middlewares/validation.middleware";
import { generateMillisecondsFromDuration } from "@utils/generate.utils";

class App {
    private app: Express;

    constructor() {
        this.app = express()

        this.initMiddlewares();
        this.initRoutes();
    }

    private initMiddlewares() {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(ValidationMiddleware.validateCSRF);
        this.app.use(cors({
            origin: [
                'http://localhost:3000', // your frontend url
                'https://mywebsite.com', // your production url optional
            ],
            methods: ["GET", "POST", "DELETE"],
            allowedHeaders: ["Content-Type", "x-csrf-token"],
            credentials: true
        }))
    }

    private initRoutes() {

        // /api/auth/*
        this.app.use("/api/auth", authRoutes);

        // /api/user/*
        this.app.use("/api/user", userRoutes);
    }

    public start() {
        const { APP_PORT, APP_HOST } = appConfig;

        this.app.listen(APP_PORT, APP_HOST, () => {
            console.log(`server is running on http://${APP_HOST}:${APP_PORT}`);

        })
    }
}

export default App;
