import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import {PostsService} from "../../application/posts.application";

export const updatePostHandler = async (
    req: Request<{id: string}, PostInputModel, PostInputModel, {}>,
    res: Response
) => {
    try {
        const { id } = req.params;
        const post = req.body;

        const isUpdated = await PostsService.updatePost(id, post);

        if (!isUpdated) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};