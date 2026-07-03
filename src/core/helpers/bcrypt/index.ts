import bcrypt from "bcrypt";
import {injectable} from "inversify";

@injectable()
export class BcryptService {
    hashPassword(password: string): string {
        return bcrypt.hashSync(password, 10)
    }

    async comparePasswords(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }
}
