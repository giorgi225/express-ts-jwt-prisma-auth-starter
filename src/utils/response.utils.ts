import { Response } from "express";

class Send {
    // 200 - Success response
    static success(res: Response, data: any, message = "success") {
        res.status(200).json({
            ok: true,
            message,
            data
        });
        return;
    }

    // 500 - Generic error response
    static error(res: Response, data: any, message = "error") {
        res.status(500).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    // 409 - Conflict, resource already exists or similar issues
    static conflict(res: Response, data: any = null, message = "Conflict error") {
        res.status(409).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    // 404 - Resource not found
    static notFound(res: Response, data: any, message = "not found") {
        res.status(404).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    // 401 - Unauthorized (missing or invalid token)
    static unauthorized(res: Response, data: any, message = "unauthorized") {
        res.status(401).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    // 422 - Validation error (e.g., invalid input)
    static validationErrors(res: Response, errors: Record<string, string[]>) {
        res.status(422).json({
            ok: false,
            message: "Validation error",
            errors,
        });
        return;
    }

    // 403 - Forbidden (insufficient permissions)
    static forbidden(res: Response, data: any, message = "forbidden") {
        res.status(403).json({
            ok: false,
            message,
            data,
        });
        return;
    }

    // 400 - Bad request (malformed request or missing data)
    static badRequest(res: Response, data: any, message = "bad request") {
        res.status(400).json({
            ok: false,
            message,
            data,
        });
        return;
    }
}

export default Send;