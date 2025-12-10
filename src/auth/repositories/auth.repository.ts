import {blackListCollection} from "../../core/db/mongo.db";
import {add} from "date-fns/add";

export const AuthRepository = {
    async insertTokenToBlackList(token: string, expireAt?: Date) {
        await blackListCollection.insertOne({
            accessToken: token,
            expireAt: expireAt || add(new Date(), {
                days: 30,
            })
        });
    }
};