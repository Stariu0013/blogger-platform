import {Request, Response} from "express";
import {securityService} from "../../application/security.application";
import {ResultStatus} from "../../../core/types/result-status";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const getDevicesHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()

        const result = await securityService.getDevices(userId)

        if (result.status === ResultStatus.Success) {
            res.status(HttpStatuses.OK).send(result.data)
            return
        }

        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
