import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../../composition-root";
import {ResultStatus} from "../../../core/types/result-status";

export const handleRecoverPassword = async (
    req: Request<{}, {}, { email: string }>,
    res: Response,
) => {
    try {
        const {email} = req.body;
        const confirmationResult = await authService.passwordRecovery(email);

        if (confirmationResult.status === ResultStatus.Success) {
            res.status(HttpStatuses.NO_CONTENT).send();

            return;
        }

        res.status(HttpStatuses.BAD_REQUEST).json({
            errorsMessages: confirmationResult.extension || []
        });
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};