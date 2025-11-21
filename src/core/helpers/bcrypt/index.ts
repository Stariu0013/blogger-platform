import bcrypt from "bcrypt";

export const bcryptService = {
    hashPassword: (password: string) => {
        return bcrypt.hashSync(password, 10);
    },
    comparePasswords: async (password: string, hash: string) => {
        return await bcrypt.compare(password, hash);
    }
}