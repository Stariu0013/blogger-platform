import {Request, Response} from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import {CommentsService} from "../../application/comments.service";
import {commentsQueryRepository} from "../../repositories/comments.query-repository";

export const deleteCommentById = async (
    req: Request<{ commentId: string }>,
    res: Response,
) => {
    try {
        const {commentId} = req.params;
        const user = req.user;

        const allUserComments = await commentsQueryRepository.getAllUserComments(user?.id!);

        if (!allUserComments.length) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        const isUserComment = allUserComments.find(comment => comment.id === commentId);

        if (isUserComment) {
            await CommentsService.deleteCommentById(commentId, user?.id!);

            res.sendStatus(HttpStatuses.NO_CONTENT);

            return;
        } else {
            res.sendStatus(HttpStatuses.FORBIDDEN);

            return;
        }
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);

        return;
    }
};