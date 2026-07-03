import {Request, Response} from "express";
import {BlogInputModel} from "../../types/blogs.input-dto";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {blogsService as BlogsService} from "../../../composition-root";

export const updateBlogHandler = async (
    req: Request<{id: string}, BlogInputModel, BlogInputModel, {}>,
    res: Response
) => {
    try {
        const { id } = req.params;
        const blog = req.body;

        const isUpdated = await BlogsService.updateBlog(id, blog);

        if (!isUpdated) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        res.sendStatus(HttpStatuses.NO_CONTENT);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};