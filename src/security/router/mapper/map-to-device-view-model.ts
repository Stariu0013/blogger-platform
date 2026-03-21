import {DeviceSession, DeviceViewModel} from "../../types/security.types";

export const mapToDeviceViewModel = (session: DeviceSession): DeviceViewModel => ({
    ip: session.ip,
    title: session.title,
    lastActiveDate: session.lastActiveDate,
    deviceId: session.deviceId,
})
