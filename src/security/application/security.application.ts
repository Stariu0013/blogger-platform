import {Result} from "../../core/types/result-type";
import {ResultStatus} from "../../core/types/result-status";
import {DeviceViewModel} from "../types/security.types";
import {SecurityQueryRepository} from "../repositories/security.query-repository";
import {SecurityRepository} from "../repositories/security.repository";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class SecurityService {
    constructor(
        @inject(TYPES.SecurityRepository)      private securityRepository: SecurityRepository,
        @inject(TYPES.SecurityQueryRepository) private securityQueryRepository: SecurityQueryRepository,
    ) {}

    async getDevices(userId: string): Promise<Result<DeviceViewModel[]>> {
        const sessions = await this.securityQueryRepository.findSessionsByUserId(userId);
        return {
            status: ResultStatus.Success,
            data: sessions.map(session => ({
                ip: session.ip,
                title: session.title,
                lastActiveDate: session.lastActiveDate,
                deviceId: session.deviceId,
            })),
            extension: [],
        };
    }

    async deleteAllOtherSessions(userId: string, currentDeviceId: string): Promise<Result<null>> {
        await this.securityRepository.deleteAllSessionsExceptCurrent(userId, currentDeviceId);
        return {status: ResultStatus.Success, data: null, extension: []};
    }

    async deleteDeviceSession(userId: string, targetDeviceId: string): Promise<Result<null>> {
        const session = await this.securityQueryRepository.findSessionByDeviceId(targetDeviceId);

        if (!session) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Session not found',
                extension: [{field: 'deviceId', message: 'Session not found'}],
            };
        }

        if (session.userId !== userId) {
            return {
                status: ResultStatus.Forbidden,
                data: null,
                errorMessage: 'Forbidden',
                extension: [{field: 'deviceId', message: 'Access denied'}],
            };
        }

        await this.securityRepository.deleteSessionByDeviceId(targetDeviceId);
        return {status: ResultStatus.Success, data: null, extension: []};
    }
}
