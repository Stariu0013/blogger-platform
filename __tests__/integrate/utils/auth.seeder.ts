import {UserInputModel} from "../../../src/users/types/types.dto";
import {randomUUID} from "node:crypto";
import {add} from "date-fns/add";
import {usersCollection} from "../../../src/core/db/mongo.db";

type RegisterUserPayloadType = {
    login: string,
    pass: string,
    email: string,
    code?: string,
    expirationDate?: Date,
    isConfirmed?: boolean
}

type RegisterUserResultType = {
    id: string,
    login: string,
    email: string,
    passwordHash: string,
    createdAt: Date,
    emailConfirmation: {
        confirmationCode: string,
        expirationDate: Date,
        isConfirmed: boolean
    }
}

export const authSeed = {
    createUserDto(): UserInputModel {
        return {
            login: 'testLogin',
            email: 'useremail@gmail.com',
            password: 'Password'
        };
    },
    createUsersDtos(count: number): UserInputModel[] {
        const users: UserInputModel[] = [];

        for (let i = 0; i < count; i++) {
            users.push({
                login: `testLogin${i}`,
                email: `useremail${i}@gmail.com`,
                password: 'Password'
            });
        }

        return users;
    },
    async insertUser({
                   login,
                   pass,
                   email,
                   code,
                   expirationDate,
                   isConfirmed
               }: RegisterUserPayloadType): Promise<RegisterUserResultType> {
        const newUser = {
            login,
            email,
            passwordHash: pass,
            createdAt: new Date(),
            emailConfirmation: {
                confirmationCode: code ?? randomUUID(),
                expirationDate: expirationDate || add(new Date(), {
                    minutes: 30
                }),
                isConfirmed: isConfirmed ?? false
            }
        };

        const res = await usersCollection.insertOne(newUser);

        return {
            id: res.insertedId.toString(),
            ...newUser
        };
    }
};