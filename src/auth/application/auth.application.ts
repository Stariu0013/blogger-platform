import {UsersQueryRepository} from "../../users/repository/usersQueryRepository";
import {User} from "../../users/instance/User.instance";
import {BcryptService} from "../../core/helpers/bcrypt";
import {Result} from "../../core/types/result-type";
import {ResultStatus} from "../../core/types/result-status";
import {WithId} from "mongodb";
import {UsersRepository} from "../../users/repository/usersRepository";
import {EmailService} from "../../emails/service/email.service";
import {JwtService} from "../services/jwtService";
import {randomUUID} from "node:crypto";
import {add} from "date-fns/add";
import {UserViewModel} from "../../users/types/types.dto";
import {AuthRepository} from "../repositories/auth.repository";
import {JwtPayload} from "jsonwebtoken";
import {SecurityRepository} from "../../security/repositories/security.repository";
import {SecurityQueryRepository} from "../../security/repositories/security.query-repository";
import {Settings} from "../../core/settings/settings";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.UsersQueryRepository) private usersQueryRepository: UsersQueryRepository,
        @inject(TYPES.UsersRepository) private usersRepository: UsersRepository,
        @inject(TYPES.BcryptService) private bcryptService: BcryptService,
        @inject(TYPES.EmailService) private emailService: EmailService,
        @inject(TYPES.JwtService) private jwtService: JwtService,
        @inject(TYPES.SecurityRepository) private securityRepository: SecurityRepository,
        @inject(TYPES.SecurityQueryRepository) private securityQueryRepository: SecurityQueryRepository,
        @inject(TYPES.AuthRepository) private authRepository: AuthRepository,
    ) {
    }

    async loginUser(
        loginOrEmail: string,
        password: string,
        ip: string,
        userAgent: string | undefined,
    ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
        const userResult = await this.checkUserCredentials(loginOrEmail, password);

        if (userResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extension: [{field: 'loginOrEmail', message: 'Wrong credentials'}],
            };
        }

        const userId = userResult.data!._id.toString();
        const deviceId = randomUUID();
        const lastActiveDate = new Date().toISOString();
        const expiresAt = new Date(Date.now() + +Settings.REFRESH_TOKEN_EXPIRATION_TIME * 1000);

        await this.securityRepository.createSession({
            deviceId,
            userId,
            ip,
            title: userAgent || 'Unknown device',
            lastActiveDate,
            expiresAt,
        });

        const accessToken = this.jwtService.createJWT(userResult.data!);
        const refreshToken = this.jwtService.createRefreshToken(userId, deviceId);

        return {
            status: ResultStatus.Success,
            data: {accessToken, refreshToken},
            extension: [],
        };
    }

    async registerUser(login: string, email: string, password: string): Promise<Result<User | null>> {
        const user = await this.usersRepository.doesUserExistByLoginOrEmail(login, email);

        if (user) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'loginOrEmail', message: 'User already exists'}],
            };
        }

        const passwordHash = await this.bcryptService.hashPassword(password);
        const newUser: User = new User(login, email, passwordHash);

        await this.usersRepository.createUser(newUser);

        try {
            await this.emailService.sendRegistrationEmail(email, newUser.emailConfirmation.confirmationCode);
        } catch (e) {
            console.error(e);
        }

        return {status: ResultStatus.Success, data: newUser, extension: []};
    }

    async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<WithId<User> | null>> {
        const user = await this.usersQueryRepository.findByLoginAndEmail(loginOrEmail);

        if (!user) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not found',
                extension: [{field: 'password', message: 'Wrong password'}],
            };
        }

        const isPassCorrect = await this.bcryptService.comparePasswords(password, user.passwordHash);

        if (!isPassCorrect) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'password', message: 'Wrong password'}],
            };
        }

        return {status: ResultStatus.Success, data: user, extension: []};
    }

    async confirmEmail(code: string): Promise<Result<any>> {
        const user = await this.usersQueryRepository.findUserByConfirmationCode(code);

        if (!user) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not found',
                extension: [{field: 'code', message: 'Wrong code'}],
            };
        }

        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.test(code);

        if (!isUuid) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Wrong confirmation code'}],
            };
        }

        if (user.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Code already been confirmed'}],
            };
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Code expired'}],
            };
        }

        await this.usersRepository.confirmEmail(user._id);

        return {status: ResultStatus.Success, data: null, extension: []};
    }

    async passwordRecovery(email: string): Promise<Result<any>> {
        const user = await this.usersQueryRepository.findByLoginOrEmail(email)

        if (!user) {
            return {
                status: ResultStatus.Success,
                data: null,
                errorMessage: '',
                extension: [],
            };
        }

        const newRecoveryCode = randomUUID();
        const expirationDate = add(new Date(), {hours: 1});

        await this.usersRepository.recoverPassword(user._id, newRecoveryCode, expirationDate);

        try {
            await this.emailService.sendRecoveryPassword(email, newRecoveryCode);
        } catch (e) {
            console.error(e);
        }

        return {status: ResultStatus.Success, data: null, extension: []};
    }

    async setNewPassword(code: string, password: string): Promise<Result<any>> {
        const user = await this.usersQueryRepository.findUserByRecoveryCode(code);

        if (!user) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                extension: [{ field: 'recoveryCode', message: 'Invalid recovery code' }],
            }
        }

        if (user.passwordRecovery && user.passwordRecovery.expirationDate && user.passwordRecovery.expirationDate < new Date()) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{ field: 'recoveryCode', message: 'Recovery code expired' }],
            }
        }

        const passwordHash = await this.bcryptService.hashPassword(password);
        const userId = user._id;

        if (user.passwordHash === passwordHash) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{ field: 'password', message: 'New password cannot be the same as the old one' }],
            }

        }

        await this.usersRepository.updateUserPassword(userId, passwordHash);
        await this.usersRepository.clearRecoveryData(userId);

        return {status: ResultStatus.Success, data: null, extension: []};
    }

    async resendRegistrationCode(email: string): Promise<Result<any>> {
        const user = await this.usersQueryRepository.findByLoginOrEmail(email);

        if (!user) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'email', message: 'User not found'}],
            };
        }

        if (user.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'email', message: 'Email already confirmed'}],
            };
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Code expired'}],
            };
        }

        const newConfirmationCode = randomUUID();
        const newExpirationDate = add(new Date(), {hours: 1, minutes: 3});

        await this.usersRepository.updateConfirmationInfo(user._id, newConfirmationCode, newExpirationDate);

        try {
            await this.emailService.sendRegistrationEmail(email, newConfirmationCode);
        } catch (e) {
            console.error(e);
        }

        return {status: ResultStatus.Success, data: [], extension: []};
    }

    async refreshToken(
        token: string,
        user: WithId<UserViewModel>,
        deviceId: string,
    ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
        const session = await this.securityQueryRepository.findSessionByDeviceId(deviceId);

        if (!session) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extension: [{field: 'refreshToken', message: 'Session not found'}],
            };
        }

        const lastActiveDate = new Date().toISOString();
        const expiresAt = new Date(Date.now() + +Settings.REFRESH_TOKEN_EXPIRATION_TIME * 1000);

        await this.authRepository.insertTokenToBlackList(token);
        await this.securityRepository.updateLastActiveDate(deviceId, lastActiveDate, expiresAt);

        const accessToken = this.jwtService.createJWT(user);
        const refreshToken = this.jwtService.createRefreshToken(user._id.toString(), deviceId);

        return {
            status: ResultStatus.Success,
            data: {accessToken, refreshToken},
            extension: [],
        };
    }

    async logoutUser(token: string, deviceId: string) {
        try {
            const decoded = this.jwtService.verifyRefreshToken(token);

            await this.authRepository.insertTokenToBlackList(token, (decoded as JwtPayload).expireAt);
            await this.securityRepository.deleteSessionByDeviceId(deviceId);

            return {status: ResultStatus.Success, data: null};
        } catch {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Invalid refresh token',
            };
        }
    }
}
