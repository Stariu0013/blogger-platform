import {usersCollection} from "../../core/db/mongo.db";
import {ObjectId, UUID} from "mongodb";
import {User} from "../instance/User.instance";
import {injectable} from "inversify";

@injectable()
export class UsersRepository {
    async createUser(user: User): Promise<void> {
        await usersCollection.insertOne(user);
    }

    async deleteUserById(id: string): Promise<void> {
        const deletedUser = await usersCollection.deleteOne({
            _id: new ObjectId(id),
        });
        if (deletedUser.deletedCount < 1) {
            throw new Error('User not found');
        }
    }

    async confirmEmail(id: ObjectId): Promise<void> {
        await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {'emailConfirmation.isConfirmed': true}},
        );
    }

    async recoverPassword(id: ObjectId, recoveryCode: string, expirationDate: Date): Promise<void> {
        await usersCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {
                'passwordRecovery.recoveryCode': recoveryCode,
                'passwordRecovery.expirationDate': expirationDate
            }},
        );
    }

    async doesUserExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
        const user = await usersCollection.findOne({$or: [{login}, {email}]});
        return !!user;
    }

    async updateConfirmationInfo(userId: ObjectId, newConfirmationCode: string, newExpirationDate: Date): Promise<void> {
        await usersCollection.updateOne(
            {_id: userId},
            {
                $set: {
                    'emailConfirmation.confirmationCode': newConfirmationCode,
                    'emailConfirmation.expirationDate': newExpirationDate,
                },
            },
        );
    }

    async updateUserPassword(userId: ObjectId, newPassword: string): Promise<void> {
        await usersCollection.updateOne(
            {_id: userId},
            {$set: {'password': newPassword}},
        );
    }

    async clearRecoveryData(userId: ObjectId): Promise<void> {
        await usersCollection.updateOne(
            {_id: userId},
            {$set: {
                    'passwordRecovery.recoveryCode': void 0,
                    'passwordRecovery.expirationDate': void 0
                }}
        );
    }
}
