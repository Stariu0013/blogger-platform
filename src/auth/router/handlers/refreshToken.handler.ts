import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";

export const handleRefreshToken = async (
    req: Request<{}, {}, {accessToken: string}>,
    res: Response,
) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.sendStatus(HttpStatuses.UNAUTHORIZED);
        }

        const user = req.user!;

        const result = await authService.refreshToken(refreshToken, user);

        if (result.status === ResultStatus.Success) {
            const {
                refreshToken,
                accessToken: newAccessToken
            } = result.data!;

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
            });

            res.status(HttpStatuses.OK).send({
                accessToken: newAccessToken
            });

            return;
        }

        res.sendStatus(HttpStatuses.UNAUTHORIZED);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};