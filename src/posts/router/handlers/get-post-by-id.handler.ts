import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {PostInputModel} from "../../types/post-input.model";
import PostsRepository from "../../repositories/posts.repository";

export const getPostByIdHandler = (
    req: Request<{id: string}, PostInputModel, {}, {}>, res: Response
) => {
    const {id} = req.params;

    const post = PostsRepository.getPostById(id);

    if (!post) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    res.status(HttpStatuses.OK).send(post);
};