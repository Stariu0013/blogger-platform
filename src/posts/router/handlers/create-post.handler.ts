import { Request, Response } from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import {mapToPostViewModal} from "../mapper/map-to-post-view-modal";
import {PostsService} from "../../application/posts.application";

export const createPostHandler = async (
    req: Request<{}, {}, PostInputModel>,
    res: Response,
) => {
    try {
        const post = req.body;

        const responsePost = await PostsService.createPost(post);
        const mappedPost = mapToPostViewModal(responsePost);

        res.status(HttpStatuses.CREATED).send(mappedPost);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};