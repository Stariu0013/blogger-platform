import {Request, Response} from "express";
import {UserViewModel} from "../../../users/types/types.dto";
import {usersQueryRepository} from "../../../users/repository/usersQueryRepository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {WithId} from "mongodb";
import {comparePasswords} from "../../../core/helpers/bcrypt";
import {AuthInputType} from "../../types/auth.types";

export const loginUser = async (
    req: Request<{}, {}, AuthInputType>,
    res: Response,
) => {
    const {loginOrEmail, password} = req.body;

    const user: WithId<UserViewModel> | null = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);

    if (!user) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    const {hash} = user;

    const result = await comparePasswords(password, hash!);

    if (result) {
        res.sendStatus(HttpStatuses.NO_CONTENT);

        return;
    }

    res.sendStatus(HttpStatuses.UNAUTHORIZED);
};