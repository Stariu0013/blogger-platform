import {Request, Response} from "express";
import {AuthInputType} from "../../types/auth.types";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const loginUser = async (
    req: Request<{}, {}, AuthInputType>,
    res: Response,
) => {
    try {
        const {loginOrEmail, password} = req.body;

        const authResult = await authService.loginUser(loginOrEmail, password);

        if (authResult.status === ResultStatus.Success && authResult.data) {
            const {
                accessToken,
                refreshToken,
            } = authResult.data;

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
            });

            res.status(HttpStatuses.OK).send(accessToken);

            return;
        }

        return res.status(HttpStatuses.UNAUTHORIZED).send({
            errorsMessages: authResult.extension || []
        });
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};