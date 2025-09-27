import { Request, Response } from 'express';
import {BlogInputModel} from "../../types/blogs.input-dto";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";
import {BlogsService} from "../../application/blogs.application";

export const createBlogHandler = async (
    req: Request<{}, {}, BlogInputModel>,
    res: Response,
) => {
    try {
        const blog = req.body;
        const newBlog = {
            ...blog,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };

        const responseBlog = await BlogsService.createBlog(newBlog);
        const mappedBlog = mapToBlogViewModal(responseBlog);

        res.status(HttpStatuses.CREATED).send(mappedBlog);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};