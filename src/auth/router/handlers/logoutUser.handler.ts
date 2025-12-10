import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";

export const logoutUserHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const refreshToken = req.cookies['refreshToken'];

        if (!refreshToken) {
            res.clearCookie('refreshToken');
            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        }

        await authService.logoutUser(refreshToken);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true
        });

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch(e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};