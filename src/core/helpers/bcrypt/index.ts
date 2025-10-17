import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
}

export const comparePasswords = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
}