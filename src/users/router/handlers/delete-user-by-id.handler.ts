import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {usersService} from "../../application/usersService";

export const deleteUserByIdHandler = async (
    req: Request<{ id: string }>,
    res: Response,
) => {
    try {
        const { id } = req.params;

        const isUserExists = await usersService.findUserById(id);

        if (!isUserExists) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        await usersService.deleteUserById(id)

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};