import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";

export const getBlogByIdHandler = (
    req: Request<{id: string}, BlogModel, {}, {}>, res: Response
) => {
    const {id} = req.params;

    const blog = BlogsRepository.getBlogById(id);

    if (!blog) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    res.status(HttpStatuses.OK).send(blog);
};