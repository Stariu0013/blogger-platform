import {Request, Response} from "express";
import BlogsRepository from "../../repositories/posts.repository";
import {createErrorMessage} from "../../../core/utils/creaste-error-message";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import PostsRepository from "../../repositories/posts.repository";

export const deletePostHandler = (
    req: Request<{id: string}, PostInputModel, {}, {}>,
    res: Response
) => {
    const {id} = req.params;

    const post = PostsRepository.getPostById(id);

    if (!post) {
        res.status(HttpStatuses.NOT_FOUND).send(createErrorMessage(
            [
                {
                    field: "post",
                    message: "Post not found"
                }
            ]
        ))
    }

    BlogsRepository.deletePost(id);

    res.sendStatus(HttpStatuses.NO_CONTENT);
};