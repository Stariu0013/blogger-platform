import { Request, Response } from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import PostsRepository from "../../repositories/posts.repository";
import {PostInputModel} from "../../types/post-input.model";
import {mapToPostViewModal} from "../mapper/map-to-post-view-modal";

export const createPostHandler = async (
    req: Request<{}, {}, PostInputModel>,
    res: Response,
) => {
    try {
        const post = req.body;

        const responsePost = await PostsRepository.createPost(post);
        const mappedPost = mapToPostViewModal(responsePost);

        res.status(HttpStatuses.CREATED).send(mappedPost);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};