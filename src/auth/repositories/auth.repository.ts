import {blackListCollection} from "../../core/db/mongo.db";
import {add} from "date-fns/add";
import {injectable} from "inversify";

@injectable()
export class AuthRepository {
    async insertTokenToBlackList(token: string, expireAt?: Date): Promise<void> {
        await blackListCollection.insertOne({
            accessToken: token,
            expireAt: expireAt || add(new Date(), {days: 30}),
        });
    }
}
