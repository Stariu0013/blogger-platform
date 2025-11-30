export type UserInputModel = {
    email: string;
    login: string;
    password: string;
}

export type UserViewModel = {
    id?: string;
    email: string;
    login: string;
    passwordHash: string;
    createdAt: Date;
    emailConfirmation: UserConfirmationData;
}

type UserConfirmationData = {
    confirmationCode: string;
    isConfirmed: boolean;
    expirationDate: Date;
}