import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersQueryRepository} from "../../../users/repository/usersQueryRepository";
import {usersRepository} from "../../../users/repository/usersRepository";
import {emailService} from "../../../emails/service/email.service";

export const handleResendConfirmCode = async (
    req: Request<{}, {}, {email: string}>,
    res: Response,
) => {
    try {
        const {email} = req.body;

        const user = await usersQueryRepository.findByLoginAndEmail(email);

        if (!user) {
            res.sendStatus(HttpStatuses.BAD_REQUEST);
            return;
        }

        if (user.emailConfirmation.expirationDate > new Date() && !user.emailConfirmation.isConfirmed) {
            const confirmationCode = user.emailConfirmation.confirmationCode;

            await emailService.sendRegistrationEmail(email, confirmationCode);

            return;
        }

        res.sendStatus(HttpStatuses.BAD_REQUEST);
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};