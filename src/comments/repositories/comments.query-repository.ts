import {commentsCollection, postsCollection} from "../../core/db/mongo.db";
import {CommentsQueryInput} from "../input/comments-query.input";
import {CommentViewModal} from "../types";
import {WithId} from "mongodb";

export const commentsQueryRepository = {
    async getAllUserComments(queryDto: CommentsQueryInput, userId: string): Promise<{
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
            commentatorInfo: {
                userId
            }
        }).skip(skip).sort({
            [sortBy]: sortDirection,
        }).limit(pageSize).toArray();


        const totalCount = await postsCollection.countDocuments();

        return {
            items: comments,
            totalCount
        };
    }
};