import bcrypt from "bcrypt";
import {usersCollection} from "../../core/db/mongo.db";
import {UserInputModel, UserViewModel} from "../types/types.dto";
import {ObjectId, WithId} from "mongodb";

export const usersRepository = {
    async createUser(user: UserInputModel): Promise<void> {
        const {
            login, email, password
        } = user;

        const hash = bcrypt.hashSync(password, 10);

        const resultUserData = {
            login,
            email,
            hash,
            createdAt: new Date().toISOString(),
        };

        await usersCollection.insertOne(resultUserData);

        return;
    },
    async findUserById(id: string): Promise<WithId<UserViewModel> | null> {
        return await usersCollection.findOne({
            _id: new ObjectId(id)
        });
    },
    async deleteUserById(id: string): Promise<void> {
        const deletedUser = await usersCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (deletedUser.deletedCount < 1) {
            throw new Error("User not found");
        }

        return;
    }
};