import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../types/http-statuses";
import {AuthQueryRepository} from "../../auth/repositories/auth.query-repository";

export const refreshTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies['refreshToken'];
    const isTokenInBlackList = await AuthQueryRepository.getAccessTokenFromBlackList(refreshToken);

    if (!refreshToken || isTokenInBlackList) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    next();
};