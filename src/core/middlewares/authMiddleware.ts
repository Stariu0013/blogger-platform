import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../types/http-statuses";
import {jwtService} from "../../auth/application/jwtService";
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

    const [tokenType, token] = req.headers.authorization.split(' ')[1];

    if (tokenType !== "Bearer") {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const jwtPayload = jwtService.findUserByToken(token);

    if (!jwtPayload) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const {userId} = jwtPayload;

    const foundUser = await usersQueryRepository.findUserById(userId);

    req.user = foundUser;
    next();
};