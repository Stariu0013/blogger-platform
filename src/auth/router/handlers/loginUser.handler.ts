import {Request, Response} from "express";
import {AuthInputType} from "../../types/auth.types";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const loginUser = async (
    req: Request<{}, {}, AuthInputType>,
    res: Response,
) => {
    const {loginOrEmail, password} = req.body;

    const authResult = await authService.loginUser(loginOrEmail, password);

    if (authResult.status === ResultStatus.Success) {
        const accessToken = authResult.data;

        res.status(HttpStatuses.OK).json({accessToken});

        return;
    }

    return res.status(HttpStatuses.UNAUTHORIZED);
};