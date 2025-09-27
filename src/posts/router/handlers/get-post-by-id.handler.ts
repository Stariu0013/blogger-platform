import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {PostInputModel} from "../../types/post-input.model";
import {mapToPostViewModal} from "../mapper/map-to-post-view-modal";
import {PostsService} from "../../application/posts.application";

export const getPostByIdHandler = async (
    req: Request<{id: string}, PostInputModel, {}, {}>, res: Response
) => {
    try {
        const {id} = req.params;

        const post = await PostsService.findByIdOrFail(id);

        if (!post) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        const mappedPost = mapToPostViewModal(post);

        res.status(HttpStatuses.OK).send(mappedPost);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};