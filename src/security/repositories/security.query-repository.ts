import {sessionsCollection} from "../../core/db/mongo.db";
import {DeviceSession} from "../types/security.types";
import {injectable} from "inversify";

@injectable()
export class SecurityQueryRepository {
    async findSessionsByUserId(userId: string): Promise<DeviceSession[]> {
        return sessionsCollection.find({userId}).toArray();
    }

    async findSessionByDeviceId(deviceId: string): Promise<DeviceSession | null> {
        return sessionsCollection.findOne({deviceId});
    }
}
