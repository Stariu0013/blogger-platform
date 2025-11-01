import {UsersQueryInput} from "../router/input/users-query.input";
import {ObjectId, WithId} from "mongodb";
import {UserViewModel} from "../types/types.dto";
import {usersCollection} from "../../core/db/mongo.db";

export const usersQueryRepository = {
    async findMany(queryDto: UsersQueryInput): Promise<{
        totalCount: number,
        items: WithId<UserViewModel>[]
    }> {
        const {
            sortDirection,
            pageNumber,
            pageSize,
            sortBy,
            searchLoginTerm,
            searchEmailTerm
        } = queryDto;
        const skip = pageSize * (pageNumber - 1);
        const filter: any = {};

        const orCondition = [];

        if (searchLoginTerm) {
            orCondition.push({
                login: {
                    $regex: searchLoginTerm,
                    $options: "i"
                }
            });
        }
        if (searchEmailTerm) {
            orCondition.push({
                email: {
                    $regex: searchEmailTerm,
                    $options: "i"
                }
            });
        }

        if (orCondition.length > 0) {
            filter.$or = orCondition;
        }

        const users = await usersCollection.find(filter).skip(skip).sort({[sortBy]: sortDirection}).limit(pageSize).toArray();
        const totalCount = await usersCollection.countDocuments(filter);

        return {
            items: users,
            totalCount
        };
    },
    async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            $or: [
                {
                    login: loginOrEmail
                },
                {
                    email: loginOrEmail,
                }
            ]
        });
    },
    async findByLoginAndEmail(login?: string, email?: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            $or: [
                {
                    login
                },
                {
                    email,
                }
            ]
        });
    },
    async findUserById(id: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            _id: new ObjectId(id)
        });
    },
};