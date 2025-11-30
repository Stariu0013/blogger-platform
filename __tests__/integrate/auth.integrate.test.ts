import {MongoMemoryServer} from "mongodb-memory-server";
import {dropDb, runDB, stopDb} from "../../src/core/db/mongo.db";
import {emailService} from "../../src/emails/service/email.service";
import {authService} from "../../src/auth/application/auth.application";
import {authSeed} from "./utils/auth.seeder";
import {ResultStatus} from "../../src/core/types/result-status";

describe('AUTH INTEGRATION', () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        await runDB(mongoServer.getUri());
    });

    afterAll(async () => {
        await stopDb();
    })

    describe('User Registration', () => {
        emailService.sendRegistrationEmail = jest.fn().mockImplementation((
            email: string, confirmationCode: string
        ) => Promise.resolve(true));

        const registerUserUseCase = authService.registerUser;

        it('should register user with correct data', async () => {
            const {
                login,
                email,
                password
            } = authSeed.createUserDto();

            const result = await registerUserUseCase(login, email, password);

            expect(result.status).toBe(ResultStatus.Success);
            expect(emailService.sendRegistrationEmail).toBeCalled();
            expect(emailService.sendRegistrationEmail).toBeCalledTimes(1);
        });

        it(`shouldn't register user twice`, async () => {
            const {
                login,
                email,
                password
            } = authSeed.createUserDto();

            const result = await registerUserUseCase(login, email, password);

            expect(result.status).toBe(ResultStatus.BadRequest);
        });

        describe('Confirm email', () => {
            const confirmEmailUseCase = authService.confirmEmail;

            it(`should not confirm email if user doesn't exist`, async () => {
                const res = await confirmEmailUseCase('test');

                expect(res.status).toBe(ResultStatus.NotFound);
            })

            it(`shouldn't confirm email which is confirmed`, async () => {
                const code = 'test';

                const {
                    password,
                    email,
                    login
                } = authSeed.createUserDto();

                await authSeed.insertUser({
                    login,
                    email,
                    code,
                    pass: password,
                    isConfirmed: true
                });

                const res = await confirmEmailUseCase(code);

                expect(res.status).toBe(ResultStatus.BadRequest);
            });

            it(`shouldn't confirm email with expired code`, async () => {
                const code = 'test';

                const {
                    password,
                    email,
                    login
                } = authSeed.createUserDto();

                await authSeed.insertUser({
                    login,
                    email,
                    pass: password,
                    expirationDate: new Date(),
                });

                const res = await confirmEmailUseCase(code);

                expect(res.status).toBe(ResultStatus.BadRequest);
            });

            it(`should confirm email`, async () => {
                const code = '123e4567-e89b-12d3-a456-426614174001';
                const newUser = {
                    login: 'Stariu',
                    email: 'test@gmail.com',
                    pass: 'Password'
                }

                await authSeed.insertUser({
                    ...newUser,
                    code,
                });

                const res = await confirmEmailUseCase(code);

                expect(res.status).toBe(ResultStatus.Success);
            })
        });
    })
});