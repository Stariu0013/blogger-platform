import {Request, Response} from "express";
import {UserInputModel} from "../../../users/types/types.dto";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {authService} from "../../application/auth.application";
import {ResultStatus} from "../../../core/types/result-status";

export const registerUser = async (
    req: Request<{}, {}, UserInputModel>,
    res: Response
) => {
    try {
        const {
            login,
            email,
            password,
        } = req.body;

        const result = await authService.registerUser(login, email, password);

        if (result.status !== ResultStatus.Success) {
            res.status(HttpStatuses.BAD_REQUEST).json({
                errorsMessages: result.errorMessage || []
            });
            return;
        }

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};