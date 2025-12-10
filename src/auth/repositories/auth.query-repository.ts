import {blackListCollection} from "../../core/db/mongo.db";

export const AuthQueryRepository = {
    async getAccessTokenFromBlackList(token: string) {
        const res = blackListCollection.findOne({accessToken: token});

        return !!res;
    }
}