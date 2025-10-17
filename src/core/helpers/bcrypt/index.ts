import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10);
}

export const comparePasswords = async (password: string, hash: string) => {
    const hashedPassword = await hashPassword(password);

    return await bcrypt.compare(hashedPassword, hash);
}