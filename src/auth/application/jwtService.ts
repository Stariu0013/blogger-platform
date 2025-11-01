import {UserViewModel} from "../../users/types/types.dto";
import jwt, {JwtPayload} from "jsonwebtoken";
import {Settings} from "../../core/settings/settings";
import {WithId} from "mongodb";

export const jwtService = {
    createJWT(user: WithId<UserViewModel>): string {
        const token = jwt.sign({
                userId: user._id,
            },
            Settings.JWT_SECRET,
            {
                expiresIn: '1h'
            });

        return token;
    },
    findUserByToken(token: string) {
        try {
            const result = jwt.verify(token, Settings.JWT_SECRET) as JwtPayload;

            return result;
        } catch (e) {
            return null;
        }
    }
}