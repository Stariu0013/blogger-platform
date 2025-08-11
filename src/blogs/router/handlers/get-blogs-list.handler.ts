import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";

export const getBlogsListHandler = async (req: Request, res: Response) => {
    try {
        const blogs = await BlogsRepository.getAllBlogs();

        res.status(HttpStatuses.OK).send(blogs);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};