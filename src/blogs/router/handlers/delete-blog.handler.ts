import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import BlogsRepository from "../../repositories/blogs.repository";
import {createErrorMessage} from "../../../core/utils/creaste-error-message";
import {HttpStatuses} from "../../../core/types/http-statuses";

export const deleteBlogHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>,
    res: Response
) => {
    try {
        const {id} = req.params;

        const blog = await BlogsRepository.getBlogById(id);

        if (!blog) {
            res.status(HttpStatuses.NOT_FOUND).send(createErrorMessage(
                [
                    {
                        field: "blog",
                        message: "Blog not found"
                    }
                ]
            ));

            return;
        }

        BlogsRepository.deleteBlog(id);

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};