import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import {mapToBlogViewModal} from "../mapper/map-to-blog-view-modal";

export const getBlogByIdHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>, res: Response
) => {
    const {id} = req.params;

    const blog = await BlogsRepository.getBlogById(id);

    if (!blog) {
        res.sendStatus(HttpStatuses.NOT_FOUND);

        return;
    }

    const mappedBlog = mapToBlogViewModal(blog);

    res.status(HttpStatuses.OK).send(mappedBlog);
};