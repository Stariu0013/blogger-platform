import { Request, Response } from 'express';
import {HttpStatuses} from "../../../core/types/http-statuses";
import {PostInputModel} from "../../../posts/types/post-input.model";
import {BlogsService} from "../../application/blogs.application";
import {mapToPostViewModal} from "../../../posts/router/mapper/map-to-post-view-modal";

export const createPostToBlogHandler = async (
    req: Request<{id: string}, {}, PostInputModel>,
    res: Response,
) => {
    try {
        const post = req.body;
        const blogId = req.params.id;

        const blogItem = await BlogsService.findByIdOrFail(blogId)

        if (!blogItem) {
            res.sendStatus(HttpStatuses.NOT_FOUND);
            return;
        }

        const newPost = {
            ...post,
            blogId,
            createdAt: new Date().toISOString(),
        };

        const responsePost = await BlogsService.createPostForBlog(newPost);
        const mappedPost = mapToPostViewModal(responsePost);

        res.status(HttpStatuses.CREATED).send(mappedPost);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};