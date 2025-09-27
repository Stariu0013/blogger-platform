import { Request, Response } from 'express';
import {BlogInputModel} from "../../types/blogs.input-dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";
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

        const newPost = {
            ...post,
            blogId
        };

        const responsePost = await BlogsService.createPostForBlog(newPost);
        const mappedPost = mapToPostViewModal(responsePost);

        res.status(HttpStatuses.CREATED).send(mappedPost);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};