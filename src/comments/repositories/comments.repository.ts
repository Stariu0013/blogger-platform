import {UserViewModel} from "../../users/types/types.dto";
import {commentsCollection} from "../../core/db/mongo.db";
import {ObjectId, WithId} from "mongodb";
import {injectable} from "inversify";

@injectable()
export class CommentsRepository {
    async createComment(postId: string, content: string, userInfo: WithId<UserViewModel>) {
        const newComment = {
            content,
            postId: new ObjectId(postId),
            commentatorInfo: {
                userId: userInfo._id.toString(),
                userLogin: userInfo.login,
            },
            createdAt: new Date().toISOString(),
        };
        const insertResult = await commentsCollection.insertOne(newComment);
        return {...newComment, _id: insertResult.insertedId};
    }

    async deleteCommentById(id: string): Promise<boolean> {
        const res = await commentsCollection.deleteOne({_id: new ObjectId(id)});
        return res.deletedCount >= 1;
    }

    async updateCommentById({id, content}: {id: string; content: string}): Promise<boolean> {
        const updateResult = await commentsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {content}},
        );
        return updateResult.matchedCount >= 1;
    }
}
