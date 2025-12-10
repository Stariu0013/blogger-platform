import {UserViewModel} from "../../users/types/types.dto";
import jwt, {JwtPayload} from "jsonwebtoken";
import {Settings} from "../../core/settings/settings";
import {WithId} from "mongodb";

export const jwtService = {
    createJWT(user: WithId<UserViewModel>): string {
        const token = jwt.sign({
                userId: user._id.toString(),
            },
            Settings.JWT_SECRET,
            {
                expiresIn: +Settings.JWT_EXPIRATION_TIME
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
    },
    createRefreshToken(userId: string): string {
        const token = jwt.sign({userId}, Settings.REFRESH_TOKEN_SECRET, {expiresIn: +Settings.REFRESH_TOKEN_EXPIRATION_TIME * 1000 });

        return token;
    },
    verifyRefreshToken(token: string) {
        try {
            const result = jwt.verify(token, Settings.REFRESH_TOKEN_SECRET);

            return result;
        } catch (e) {
            return null;
        }
    }
}