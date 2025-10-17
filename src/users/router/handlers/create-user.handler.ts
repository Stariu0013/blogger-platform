import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {UserInputModel} from "../../types/types.dto";
import {usersService} from "../../application/usersService";
import {mapToUserViewModel} from "../mapper/map-to-user-view-model";
import {usersQueryRepository} from "../../repository/usersQueryRepository";

export const createUserHandler = async (
    req: Request<{}, {}, UserInputModel>,
    res: Response
) => {
    try {
        const { login, email } = req.body;

        const isUserExists = await usersQueryRepository.findByLoginAndEmail(login, email);

        if (isUserExists) {
            res.status(HttpStatuses.BAD_REQUEST).send({
                errorsMessages: 'User already exists'
            });

            return;
        }

        await usersService.createUser(req.body);

        const createdUser = await usersQueryRepository.findByLoginAndEmail(login, email);

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