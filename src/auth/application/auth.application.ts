import {usersQueryRepository} from "../../users/repository/usersQueryRepository";
import {User} from "../../users/instance/User.instance";
import {bcryptService} from "../../core/helpers/bcrypt";
import {Result} from "../../core/types/result-type";
import {ResultStatus} from "../../core/types/result-status";
import {WithId} from "mongodb";
import {usersRepository} from "../../users/repository/usersRepository";
import {emailService} from "../../emails/service/email.service";
import {jwtService} from "./jwtService";
import { randomUUID } from "node:crypto";
import {add} from "date-fns/add";

export const authService = {
    async loginUser(loginOrEmail: string, password: string): Promise<Result<{ accessToken: string } | null>> {
        const userResult = await this.checkUserCredentials(loginOrEmail, password);

        if (userResult.status !== ResultStatus.Success) {
            return {
                status: ResultStatus.Unauthorized,
                data: null,
                errorMessage: 'Unauthorized',
                extension: [{field: 'loginOrEmail', message: 'Wrong credentials'}]
            };
        }

        const accessToken = jwtService.createJWT(userResult.data!);

        return {
            status: ResultStatus.Success,
            data: {accessToken},
            extension: []
        }
    },
    async registerUser(login: string, email: string, password: string): Promise<Result<User | null>> {
        const user = await usersRepository.doesUserExistByLoginOrEmail(login, email);

        if (user) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'loginOrEmail', message: 'User already exists'}]
            };
        }

        const passwordHash = await bcryptService.hashPassword(password);
        const newUser: User = new User(login, email, passwordHash);

        await usersRepository.createUser(newUser);

        try {
            await emailService.sendRegistrationEmail(email, newUser.emailConfirmation.confirmationCode);
        } catch (e) {
            console.error(e);
        }

        return {
            status: ResultStatus.Success,
            data: newUser,
            extension: []
        };
    },
    async checkUserCredentials(loginOrEmail: string, password: string): Promise<Result<WithId<User> | null>> {
        const user = await usersQueryRepository.findByLoginAndEmail(loginOrEmail);

        if (!user) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not found',
                extension: [{field: 'password', message: 'Wrong password'}]
            }
        }

        const isPassCorrect = await bcryptService.comparePasswords(password, user.passwordHash);

        if (!isPassCorrect) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'password', message: 'Wrong password'}]
            }
        }

        return {
            status: ResultStatus.Success,
            data: user,
            extension: []
        }
    },
    async confirmEmail(code: string): Promise<Result<any>> {
        const user = await usersQueryRepository.findUserByConfirmationCode(code);

        if (!user) {
            return {
                status: ResultStatus.NotFound,
                data: null,
                errorMessage: 'Not found',
                extension: [{field: 'code', message: 'Wrong code'}]
            }
        }

        const isUuid = new RegExp(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i
        ).test(code);

        if (!isUuid) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Wrong confirmation code'}]
            }
        }

        if (user.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'email', message: 'Code already been confirmed'}]
            }
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Code expired'}]
            }
        }

        await usersRepository.confirmEmail(user._id);

        return {
            status: ResultStatus.Success,
            data: null,
            extension: []
        }
    },

    async resendRegistrationCode(email: string): Promise<Result<any>> {
        const user = await usersQueryRepository.findByLoginOrEmail(email);

        if (!user) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'email', message: 'User not found'}]
            }
        }

        if (user.emailConfirmation.isConfirmed) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'email', message: 'Email already confirmed'}]
            }
        }

        if (user.emailConfirmation.expirationDate < new Date()) {
            return {
                status: ResultStatus.BadRequest,
                data: null,
                errorMessage: 'Bad request',
                extension: [{field: 'code', message: 'Code expired'}]
            }
        }

        const newConfirmationCode = randomUUID();
        const newExpirationDate = add(new Date(), { hours: 1, minutes: 3 });

        await usersRepository.updateConfirmationInfo(user._id, newConfirmationCode, newExpirationDate);

        try {
            await emailService.sendRegistrationEmail(email, newConfirmationCode);
        } catch (e) {
            console.error(e);
        }

        return {
            status: ResultStatus.Success,
            data: [],
            extension: []
        };
    }
}