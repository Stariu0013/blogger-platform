import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";
import {BlogsService} from "../../application/blogs.application";

export const getBlogByIdHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>, res: Response
) => {
    try {
        const {id} = req.params;

        const blog = await BlogsService.findByIdOrFail(id);

        if (!blog) {
            res.sendStatus(HttpStatuses.NOT_FOUND);

            return;
        }

        const mappedBlog = mapToBlogViewModal(blog);

        res.status(HttpStatuses.OK).send(mappedBlog);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};