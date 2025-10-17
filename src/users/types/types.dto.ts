export type UserInputModel = {
    email: string;
    login: string;
    password: string;
}

export type UserViewModel = {
    id?: string;
    email: string;
    login: string;
    hash: string;
    createdAt: string;
}
