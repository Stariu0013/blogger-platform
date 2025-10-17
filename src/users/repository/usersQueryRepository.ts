import {UsersQueryInput} from "../router/input/users-query.input";
import {WithId} from "mongodb";
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

        if (searchLoginTerm) {
            filter.login = {
                $regex: searchLoginTerm,
                $options: "i"
            };
        }
        if (searchEmailTerm) {
            filter.email = {
                $regex: searchEmailTerm,
                $options: "i"
            }
        }

        const users = await usersCollection.find(filter).skip(skip).sort({[sortBy]: sortDirection}).limit(pageSize).toArray();
        const totalCount = await usersCollection.countDocuments(filter);

        return {
            items: users,
            totalCount
        };
    },
    async findByLoginOrEmail(login: string, email: string): Promise<WithId<UserViewModel> | null> {
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
    async findUserByEmail(email: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            email,
        });
    },
    async findUserByLogin(login: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            login,
        });
    }
};