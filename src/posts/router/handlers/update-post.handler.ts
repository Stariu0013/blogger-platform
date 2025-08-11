import {Request, Response} from "express";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import PostsRepository from "../../repositories/posts.repository";

export const updatePostHandler = (
    req: Request<{id: string}, PostInputModel, PostInputModel, {}>,
    res: Response
) => {
    const { id } = req.params;
    const post = req.body;

    PostsRepository.updatePost(id, post);

    res.sendStatus(HttpStatuses.NO_CONTENT);
};