import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {commentsRepository} from "../../repositories/comments.repository";
import {commentsQueryRepository} from "../../repositories/comments.query-repository";

export const updateCommentById = async (
    req: Request<{ commentId: string }, {}, { content: string }>,
    res: Response
) => {
    try {
        const {content} = req.body;
        const {commentId} = req.params;
        const userId = req.user!._id.toString();

        const comment = await commentsQueryRepository.getCommentById(commentId);

        if (!comment) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        if (comment.commentatorInfo.userId !== userId) {
            res.sendStatus(HttpStatuses.FORBIDDEN);

            return;
        }

        const updateResult = await commentsRepository.updateCommentById({
            content,
            id: commentId
        });

        if (updateResult) {
            res.sendStatus(HttpStatuses.NO_CONTENT)
        }
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);

        return;
    }
};