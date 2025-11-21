import {Request, Response} from "express";
import {UserInputModel} from "../../../users/types/types.dto";
import {usersQueryRepository} from "../../../users/repository/usersQueryRepository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersService} from "../../../users/application/usersService";
import {emailService} from "../../../emails/service/email.service";
import {User} from "../../../users/instance/User.instance";
import {bcryptService} from "../../../core/helpers/bcrypt";

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

        const isUserExists = await usersQueryRepository.findByLoginAndEmail(login, email);

        if (isUserExists) {
            res.sendStatus(HttpStatuses.BAD_REQUEST);

            return;
        }

        const hash = bcryptService.hashPassword(password);
        const newUser = new User(login, email, hash);

        await usersService.createUser(newUser);

        await emailService.sendConfirmationEmail(email, newUser.emailConfirmation.confirmationCode)
    } catch (e) {
        console.error(e);
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};