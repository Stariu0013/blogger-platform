import { Request, Response } from 'express';
import {BlogInputModel} from "../../types/blogs.input-dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const createBlogHandler = (
    req: Request<{}, {}, BlogInputModel>,
    res: Response,
) => {
    const blog = req.body;

    const responseBlog = BlogsRepository.createBlog(blog);

    res.status(HttpStatuses.CREATED).send(responseBlog);
};