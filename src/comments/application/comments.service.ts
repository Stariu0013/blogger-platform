import {CommentsRepository} from "../repositories/comments.repository";
import {UserViewModel} from "../../users/types/types.dto";
import {WithId} from "mongodb";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class CommentsService {
    constructor(
        @inject(TYPES.CommentsRepository) private commentsRepository: CommentsRepository,
    ) {}

    async createComment(postId: string, content: string, user: WithId<UserViewModel>) {
        return this.commentsRepository.createComment(postId, content, user);
    }

    async deleteCommentById(id: string, userId: string) {
        return this.commentsRepository.deleteCommentById(id);
    }

    async updateCommentById(id: string, content: string, userId: string) {
        return this.commentsRepository.updateCommentById({id, content});
    }
}
