import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";

export const getBlogsListHandler = (req: Request, res: Response) => {
    const blogs = BlogsRepository.getAllBlogs();

    res.status(HttpStatuses.OK).send(blogs);
};