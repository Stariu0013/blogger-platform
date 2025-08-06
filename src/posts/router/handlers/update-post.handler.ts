import {Request, Response} from "express";
import {db} from "../../../db";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../types/post-input.model";
import PostsRepository from "../../repositories/posts.repository";

export const updatePostHandler = (
    req: Request<{id: string}, PostInputModel, PostInputModel, {}>,
    res: Response
) => {
    const { id } = req.params;

    const targetPost = db.posts.find(post => post.id === id);

    console.log({
        targetPost,
        id
    })

    if (!targetPost) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    const post = req.body;

    PostsRepository.updatePost(id, post);

    console.log({
        post,
        id
    })

    res.sendStatus(HttpStatuses.NO_CONTENT);
};