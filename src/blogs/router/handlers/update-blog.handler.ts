import {Request, Response} from "express";
import {BlogInputModel} from "../../types/blogs.input-dto";
import {db} from "../../../db";
import {HttpStatuses} from "../../../core/types/http-statuses";
import BlogsRepository from "../../repositories/blogs.repository";

export const updateBlogHandler = (
    req: Request<{id: string}, BlogInputModel, BlogInputModel, {}>,
    res: Response
) => {
    const { id } = req.params;

    const targetBlog = db.blogs.find(blog => blog.id === id);

    if (!targetBlog) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    const blog = req.body;

    BlogsRepository.updateBlog(id, blog);

    res.sendStatus(HttpStatuses.NO_CONTENT);
};