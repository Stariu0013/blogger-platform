import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {UserInputModel} from "../../types/types.dto";
import {usersService} from "../../application/usersService";
import {mapToUserViewModel} from "../mapper/map-to-user-view-model";
import {usersQueryRepository} from "../../repository/usersQueryRepository";
import {bcryptService} from "../../../core/helpers/bcrypt";
import {User} from "../../instance/User.instance";

export const createUserHandler = async (
    req: Request<{}, {}, UserInputModel>,
    res: Response
) => {
    try {
        const { login, email, password } = req.body;

        const isUserExists = await usersQueryRepository.findByLoginAndEmail(login || email);

        if (isUserExists) {
            res.status(HttpStatuses.BAD_REQUEST).send({
                errorsMessages: 'User already exists'
            });

            return;
        }

        const hash = bcryptService.hashPassword(password);
        const newUser = new User(login, email, hash);

        await usersService.createUser(newUser);

        const createdUser = await usersQueryRepository.findByLoginAndEmail(login || email);

        if (!createdUser) {
            res.sendStatus(HttpStatuses.NOT_FOUND);
            return;
        }

        const mappedUser = mapToUserViewModel(createdUser);

        res.status(HttpStatuses.CREATED).send(mappedUser);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};