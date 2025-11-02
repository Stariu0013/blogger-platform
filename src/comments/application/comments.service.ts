import {commentsRepository} from "../repositories/comments.repository";
import {UserViewModel} from "../../users/types/types.dto";
import {WithId} from "mongodb";

export const CommentsService = {
    async createComment(postId: string, content: string, user: WithId<UserViewModel>) {
        return await commentsRepository.createComment(postId, content, user);
    },
    async deleteCommentById(id: string, userId: string) {
        return await commentsRepository.deleteCommentById(id);
    },
    async updateCommentById(id: string, content: string, userId: string) {
        return await commentsRepository.updateCommentById({
            id,
            content,
        });
    }
}