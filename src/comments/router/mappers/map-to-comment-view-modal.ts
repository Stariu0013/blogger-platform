import {WithId} from "mongodb";
import {CommentViewModal} from "../../types";

export const mapToCommentViewModal = (comment: WithId<CommentViewModal>): CommentViewModal => {
    return {
        id: comment._id.toString(),
        content: comment.content,
        createdAt: comment.createdAt,
        commentatorInfo: comment.commentatorInfo,
    }
}