import {Router} from "express";
import {refreshTokenMiddleware} from "../../core/middlewares/refreshTokenMiddleware";
import {getDevicesHandler} from "./handlers/get-devices.handler";
import {deleteAllDevicesHandler} from "./handlers/delete-all-devices.handler";
import {deleteDeviceHandler} from "./handlers/delete-device.handler";

export const securityRouter = Router()

securityRouter.get('/devices', refreshTokenMiddleware, getDevicesHandler)
securityRouter.delete('/devices', refreshTokenMiddleware, deleteAllDevicesHandler)
securityRouter.delete('/devices/:deviceId', refreshTokenMiddleware, deleteDeviceHandler)
