import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {createErrorMessage} from "../../../core/utils/creaste-error-message";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const deleteBlogHandler = (
    req: Request<{id: string}, BlogModel, {}, {}>,
    res: Response
) => {
    const {id} = req.params;

    const blog = BlogsRepository.getBlogById(id);

    if (!blog) {
        res.status(HttpStatuses.NOT_FOUND).send(createErrorMessage(
            [
                {
                    field: "blog",
                    message: "Blog not found"
                }
            ]
        ))
    }

    BlogsRepository.deleteBlog(id);

    res.sendStatus(HttpStatuses.NO_CONTENT);
};