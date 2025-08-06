import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../../core/types/http-statuses";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "qwerty";

export const superAdminGuardMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const auth = req.headers.authorization;

    if (!auth) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const [authType, authToken] = auth.split(" ");

    if (authType !== "Basic") {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const credentials = Buffer.from(authToken, "base64").toString();
    const [username, password] = credentials.split(":");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    next();
};