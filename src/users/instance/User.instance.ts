import {randomUUID} from "node:crypto";
import {add} from "date-fns/add";

export class User {
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    emailConfirmation: {
        confirmationCode: string;
        isConfirmed: boolean;
        expirationDate: Date;
    }

    constructor(login: string, email: string, passwordHash: string) {
        this.login = login;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = new Date();
        this.emailConfirmation = {
            confirmationCode: randomUUID(),
            isConfirmed: false,
            expirationDate: add(new Date(), { hours: 1, minutes: 3 })
        };
    }
}