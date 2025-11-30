import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersQueryRepository} from "../../../users/repository/usersQueryRepository";
import {usersRepository} from "../../../users/repository/usersRepository";
import {emailService} from "../../../emails/service/email.service";
import {authService} from "../../application/auth.application";

export const handleResendConfirmCode = async (
    req: Request<{}, {}, {email: string}>,
    res: Response,
) => {
    try {
        const confirmationResult = await authService.confirmEmail(code);

        if (confirmationResult.status === ResultStatus.Success) {
            await authService.confirmEmail(code);

            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        }

        res.sendStatus(HttpStatuses.BAD_REQUEST);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};