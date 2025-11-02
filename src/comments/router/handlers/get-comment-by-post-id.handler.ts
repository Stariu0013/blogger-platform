import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {commentsQueryRepository} from "../../repositories/comments.query-repository";
import {mapToCommentViewModal} from "../mappers/map-to-comment-view-modal";

export const getCommentByIdHandler = async (
    req: Request<{ commentId: string }>,
    res: Response,
) => {
    try {
        const {commentId} = req.params;

        const comment = await commentsQueryRepository.getCommentById(commentId);

        if (!comment) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        const mappedComment = mapToCommentViewModal(comment);

        res.status(HttpStatuses.OK).send(mappedComment);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);

        return;
    }
};