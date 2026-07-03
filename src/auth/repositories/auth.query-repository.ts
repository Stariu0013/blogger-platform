import {blackListCollection} from "../../core/db/mongo.db";
import {injectable} from "inversify";

@injectable()
export class AuthQueryRepository {
    async getAccessTokenFromBlackList(token: string): Promise<boolean> {
        const res = await blackListCollection.findOne({accessToken: token});
        return !!res;
    }
}
