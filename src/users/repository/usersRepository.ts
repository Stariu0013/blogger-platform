import {usersCollection} from "../../core/db/mongo.db";
import {ObjectId} from "mongodb";
import {User} from "../instance/User.instance";

export const usersRepository = {
    async createUser(user: User): Promise<void> {
        await usersCollection.insertOne(user);

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
    },
    async confirmEmail(id: ObjectId): Promise<void> {
        await usersCollection.updateOne({
            _id: new ObjectId(id),
        }, {
            $set: {
                "emailConfirmation.isConfirmed": true,
            }
        });

        return;
    },
    async doesUserExistByLoginOrEmail(login: string, email: string) {
        const user = await usersCollection.findOne({
            $or: [{login}, {email}]
        });

        return !!user;
    }
};