import { cleanEnv, port, str } from "envalid";

// Validate environment variables for app configuration (host and port)
const appConfig = cleanEnv(process.env, {
    APP_HOST: str(),  // The hostname or IP address for the app
    APP_PORT: port(), // The port number the app will run on
})

export default appConfig;