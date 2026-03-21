import {sessionsCollection} from "../../core/db/mongo.db";
import {DeviceSession} from "../types/security.types";

class SecurityRepository {
    async createSession(session: DeviceSession): Promise<void> {
        await sessionsCollection.insertOne(session)
    }

    async updateLastActiveDate(deviceId: string, lastActiveDate: string, expiresAt: Date): Promise<void> {
        await sessionsCollection.updateOne(
            {deviceId},
            {$set: {lastActiveDate, expiresAt}},
        )
    }

    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const result = await sessionsCollection.deleteOne({deviceId})
        return result.deletedCount >= 1
    }

    async deleteAllSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
        await sessionsCollection.deleteMany({userId, deviceId: {$ne: deviceId}})
    }
}

export default new SecurityRepository()
