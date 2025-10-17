import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import {createErrorMessage} from "../../../core/utils/creaste-error-message";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {BlogsService} from "../../application/blogs.application";
import {blogsQueryRepository} from "../../repositories/blogs-query.repository";

export const deleteBlogHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>,
    res: Response
) => {
    try {
        const {id} = req.params;

        const blog = await blogsQueryRepository.findByIdOrFail(id);

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

        await BlogsService.deleteBlogById(id);

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};