import { Request, Response } from 'express';
import {BlogInputModel} from "../../types/blogs.input-dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";

export const createBlogHandler = async (
    req: Request<{}, {}, BlogInputModel>,
    res: Response,
) => {
    const blog = req.body;

    const responseBlog = await BlogsRepository.createBlog(blog);
    const mappedBlog = mapToBlogViewModal(responseBlog);

    res.status(HttpStatuses.CREATED).send(mappedBlog);
};