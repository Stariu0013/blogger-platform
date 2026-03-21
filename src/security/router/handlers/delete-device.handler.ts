import {Request, Response} from "express";
import {securityService} from "../../application/security.application";
import {ResultStatus} from "../../../core/types/result-status";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const deleteDeviceHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()
        const {deviceId} = req.params

        const result = await securityService.deleteDeviceSession(userId, deviceId)

        if (result.status === ResultStatus.Success) {
            res.sendStatus(HttpStatuses.NO_CONTENT)
            return
        }

        if (result.status === ResultStatus.NotFound) {
            res.sendStatus(HttpStatuses.NOT_FOUND)
            return
        }

        if (result.status === ResultStatus.Forbidden) {
            res.sendStatus(HttpStatuses.FORBIDDEN)
            return
        }

        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
