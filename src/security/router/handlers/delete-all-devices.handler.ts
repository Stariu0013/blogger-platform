import {Request, Response} from "express";
import {securityService} from "../../application/security.application";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const deleteAllDevicesHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()
        const currentDeviceId = req.deviceId!

        await securityService.deleteAllOtherSessions(userId, currentDeviceId)

        res.sendStatus(HttpStatuses.NO_CONTENT)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
