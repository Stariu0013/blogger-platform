import {usersCollection} from "../../core/db/mongo.db";
import {UserInputModel, UserViewModel} from "../types/types.dto";
import {ObjectId, WithId} from "mongodb";
import {hashPassword} from "../../core/helpers/bcrypt";

export const usersRepository = {
    async createUser(user: UserInputModel): Promise<void> {
        const {
            login, email, password
        } = user;

        const hash = hashPassword(password);

        const resultUserData = {
            login,
            email,
            hash,
            createdAt: new Date().toISOString(),
        };

        await usersCollection.insertOne(resultUserData);

        return;
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