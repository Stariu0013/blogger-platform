import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";

export const logoutUserHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            res.sendStatus(HttpStatuses.UNAUTHORIZED);

            return;
        }

        const result = await authService.logoutUser(refreshToken);

        if (result.status === ResultStatus.Success) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true
            });

            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        }

        return res.sendStatus(HttpStatuses.UNAUTHORIZED);
    } catch(e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};