import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersQueryRepository} from "../../../users/repository/usersQueryRepository";
import {usersRepository} from "../../../users/repository/usersRepository";

export const handleConfirmCode = async (
    req: Request<{}, {}, {code: string}>,
    res: Response,
) => {
    try {
        const {code} = req.body;

        const user = await usersQueryRepository.findUserByConfirmationCode(code);

        if (!user) {
            res.sendStatus(HttpStatuses.BAD_REQUEST);
            return;
        }

        if (user?.emailConfirmation.confirmationCode === code && user.emailConfirmation.expirationDate > new Date()) {
            await usersRepository.confirmEmail(user._id);
            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        }

        res.sendStatus(HttpStatuses.BAD_REQUEST);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};