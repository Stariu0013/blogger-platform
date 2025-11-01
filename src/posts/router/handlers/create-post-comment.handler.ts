import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {CommentInputModel} from "../../../comments/types";
import {commentsRepository} from "../../../comments/repositories/comments.repository";

export const createPostCommentHandler = async (
    req: Request<{}, {}, CommentInputModel>,
    res: Response
) => {
    try {
        const { content } = req.body;
        const user = req.user;

        await commentsRepository.createComment(content, user!);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};