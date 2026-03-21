import {NextFunction, Request, Response} from "express";
import {HttpStatuses} from "../types/http-statuses";
import {AuthQueryRepository} from "../../auth/repositories/auth.query-repository";
import {jwtService} from "../../auth/services/jwtService";
import {JwtPayload} from "jsonwebtoken";
import {usersQueryRepository} from "../../users/repository/usersQueryRepository";
import {securityQueryRepository} from "../../security/repositories/security.query-repository";

export const refreshTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const isTokenInBlackList = await AuthQueryRepository.getAccessTokenFromBlackList(refreshToken);

    if (isTokenInBlackList) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken);

    if (!decoded) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);
        return;
    }

    const {userId, deviceId} = decoded as JwtPayload;

    const session = await securityQueryRepository.findSessionByDeviceId(deviceId)

    if (!session) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);
        return;
    }

    const user = await usersQueryRepository.findUserById(userId);

    if (!user) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED);

        return;
    }

    req.user = user;
    req.deviceId = deviceId;

    next();
};