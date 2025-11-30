import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";

export const handleResendConfirmCode = async (
    req: Request<{}, {}, {email: string}>,
    res: Response,
) => {
    const {email} = req.body;

    try {
        const result = await authService.resendRegistrationCode(email);

        if (result.status === ResultStatus.Success) {
            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        }

        res.sendStatus(HttpStatuses.BAD_REQUEST);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};