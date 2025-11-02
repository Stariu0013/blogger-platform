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

        const comment = await commentsQueryRepository.getCommentById(commentId);

        if (comment!.commentatorInfo.userId !== user?._id.toString()) {
            res.sendStatus(HttpStatuses.FORBIDDEN);

            return;
        }

        await CommentsService.deleteCommentById(commentId, user?._id.toString()!);

        res.sendStatus(HttpStatuses.NO_CONTENT);

        return;
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);

        return;
    }
};