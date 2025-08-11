import {Request, Response} from "express";
import {BlogInputModel} from "../../types/blogs.input-dto";
import {HttpStatuses} from "../../../core/types/http-statuses";
import BlogsRepository from "../../repositories/blogs.repository";

export const updateBlogHandler = async (
    req: Request<{id: string}, BlogInputModel, BlogInputModel, {}>,
    res: Response
) => {
    try {
        const { id } = req.params;
        const blog = req.body;

        const isUpdated = await BlogsRepository.updateBlog(id, blog);

        if (!isUpdated) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};