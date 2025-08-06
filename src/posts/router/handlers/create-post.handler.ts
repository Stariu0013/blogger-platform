import { Request, Response } from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import PostsRepository from "../../repositories/posts.repository";
import {PostInputModel} from "../../types/post-input.model";

export const createPostHandler = (
    req: Request<{}, {}, PostInputModel>,
    res: Response,
) => {
    const post = req.body;

    const responseBlog = PostsRepository.createPost(post);

    res.status(HttpStatuses.CREATED).send(responseBlog);
};