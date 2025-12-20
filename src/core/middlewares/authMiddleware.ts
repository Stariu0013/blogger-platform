import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../types/http-statuses";
import {jwtService} from "../../auth/services/jwtService";
import {usersQueryRepository} from "../../users/repository/usersQueryRepository";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.headers.authorization) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const [tokenType, token] = req.headers.authorization.split(' ');

    if (tokenType !== "Bearer") {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const jwtPayload = await jwtService.findUserByToken(token);

    if (!jwtPayload) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const {userId} = jwtPayload;

    req.user = await usersQueryRepository.findUserById(userId);
    next();
};