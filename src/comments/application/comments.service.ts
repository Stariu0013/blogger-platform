import {commentsRepository} from "../repositories/comments.repository";
import {UserViewModel} from "../../users/types/types.dto";

export const CommentsService = {
    async createComment(content: string, user: UserViewModel) {
        return await commentsRepository.createComment(content, user);
    },
    async deleteCommentById(id: string, userId: string) {
        return await commentsRepository.deleteCommentById(id, userId);
    }
}