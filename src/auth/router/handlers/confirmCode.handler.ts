import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";

export const handleConfirmCode = async (
    req: Request<{}, {}, {code: string}>,
    res: Response,
) => {
    try {
        const {code} = req.body;
        const confirmationResult = await authService.confirmEmail(code);

        if (confirmationResult.status === ResultStatus.Success) {
            await authService.confirmEmail(code);

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