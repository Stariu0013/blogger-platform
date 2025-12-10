import {ObjectId} from "mongodb";

export interface TokenBlackList {
    accessToken: string;
    expireAt: Date;
}

export interface TokenBlackListViewModel extends TokenBlackList {
    _id: ObjectId;
}