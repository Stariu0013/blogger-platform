import {UserViewModel} from "../../users/types/types.dto";
import jwt, {JwtPayload} from "jsonwebtoken";
import {Settings} from "../../core/settings/settings";
import {WithId} from "mongodb";
import {injectable} from "inversify";

@injectable()
export class JwtService {
    createJWT(user: WithId<UserViewModel>): string {
        return jwt.sign(
            {userId: user._id.toString()},
            Settings.JWT_SECRET,
            {expiresIn: +Settings.JWT_EXPIRATION_TIME},
        );
    }

    findUserByToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, Settings.JWT_SECRET) as JwtPayload;
        } catch {
            return null;
        }
    }

    createRefreshToken(userId: string, deviceId: string): string {
        return jwt.sign(
            {userId, deviceId},
            Settings.REFRESH_TOKEN_SECRET,
            {expiresIn: +Settings.REFRESH_TOKEN_EXPIRATION_TIME},
        );
    }

    verifyRefreshToken(token: string): string | JwtPayload | null {
        try {
            return jwt.verify(token, Settings.REFRESH_TOKEN_SECRET);
        } catch {
            return null;
        }
    }
}
