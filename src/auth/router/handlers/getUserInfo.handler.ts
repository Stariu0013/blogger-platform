import {Request, Response} from "express";
import {mapToUserViewModal} from "../mapper/map-to-user-view-modal";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const getUserInfoHandler = (
    req: Request,
    res: Response,
) => {
    const user = req.user;

    const mapperUser = mapToUserViewModal(user!);

    res.status(HttpStatuses.OK).send(mapperUser);
};