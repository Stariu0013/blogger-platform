import {commentsCollection} from "../../core/db/mongo.db";
import {CommentsQueryInput} from "../input/comments-query.input";
import {CommentViewModal} from "../types";
import {ObjectId, WithId} from "mongodb";

export const commentsQueryRepository = {
    async getCommentById(id: string): Promise<WithId<CommentViewModal> | null> {
        return await commentsCollection.findOne({
            _id: new ObjectId(id)
        });
    },
    async getAllUserComments(queryDto: CommentsQueryInput, postId: string): Promise<{
        items: WithId<CommentViewModal>[],
        totalCount: number
    }> {
        const {
            pageSize,
            sortBy,
            sortDirection,
            pageNumber
        } = queryDto;
        const skip = pageSize * (pageNumber - 1);

        const comments = await commentsCollection.find({
            postId: new ObjectId(postId)
        }).skip(skip).sort({
            [sortBy]: sortDirection,
        }).limit(pageSize).toArray();

        const totalCount = await commentsCollection.countDocuments();

        return {
            items: comments,
            totalCount
        };
    }
};