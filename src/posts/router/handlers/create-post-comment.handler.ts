import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {CommentInputModel} from "../../../comments/types";
import {commentsRepository} from "../../../comments/repositories/comments.repository";
import {postsQueryRepository} from "../../repositories/posts-query.repository";
import {mapToCommentViewModal} from "../../../comments/router/mappers/map-to-comment-view-modal";

export const createPostCommentHandler = async (
    req: Request<{postId: string}, {}, CommentInputModel>,
    res: Response
) => {
    try {
        const { content } = req.body;
        const { postId } = req.params;
        const user = req.user;

        const targetPost = await postsQueryRepository.findByIdOrFail(postId);

        if (!targetPost) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        const createdComment = await commentsRepository.createComment(postId, content, user!);
        const mappedComment = mapToCommentViewModal(createdComment);

        res.status(HttpStatuses.CREATED).send(mappedComment);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};