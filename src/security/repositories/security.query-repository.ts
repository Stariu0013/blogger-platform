import {sessionsCollection} from "../../core/db/mongo.db";
import {DeviceSession} from "../types/security.types";

export const securityQueryRepository = {
    async findSessionsByUserId(userId: string): Promise<DeviceSession[]> {
        return sessionsCollection.find({userId}).toArray()
    },

    async findSessionByDeviceId(deviceId: string): Promise<DeviceSession | null> {
        return sessionsCollection.findOne({deviceId})
    },
}
