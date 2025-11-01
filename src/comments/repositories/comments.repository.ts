import {UserViewModel} from "../../users/types/types.dto";
import {commentsCollection} from "../../core/db/mongo.db";
import {ObjectId} from "mongodb";

export const commentsRepository = {
    async createComment(content: string, userInfo: UserViewModel) {
        const newComment = {
            content,
            commentatorInfo: {
                userId: userInfo.id!,
                userLogin: userInfo.login
            },
            createdAt: new Date().toISOString(),
        };

        const insertResult = await commentsCollection.insertOne(newComment);

        return {
            ...newComment,
            _id: insertResult.insertedId,
        };
    },
    async deleteCommentById(id: string, userId: string) {
        await commentsCollection.deleteOne({
            _id: new ObjectId(id),
            commentatorInfo: {
                userId
            }
        })
    }
};