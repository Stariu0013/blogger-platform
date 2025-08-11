import { Request, Response } from 'express';
import {BlogInputModel} from "../../types/blogs.input-dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";

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

        const responseBlog = await BlogsRepository.createBlog(newBlog);
        const mappedBlog = mapToBlogViewModal(responseBlog);

        res.status(HttpStatuses.CREATED).send(mappedBlog);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};