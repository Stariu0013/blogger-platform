import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {BlogsQueryInput} from "../input/blogs-query.input";
import {mapToPostsListMappedOutput} from "../../../posts/router/mapper/map-to-posts-list-mapped-output";
import {BlogsService} from "../../application/blogs.application";

export const getPostsByBlogIdHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>, res: Response
) => {
    try {
        const {id} = req.params;

        if (!id) {
            res.sendStatus(HttpStatuses.NOT_FOUND);
            return
        }

        const blogItem = await BlogsService.findByIdOrFail(id)

        if (!blogItem) {
            res.sendStatus(HttpStatuses.NOT_FOUND);
            return;
        }

        const queryInput = setDefaultSortAndPagination(req.query as unknown as BlogsQueryInput);

        const {
            items,
            totalCount,
        } = await BlogsRepository.findPostsByBlogId(id, queryInput);

        const postsByBlogIdListOutput = mapToPostsListMappedOutput(items, {
            totalCount,
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize
        });

        res.status(HttpStatuses.OK).send(postsByBlogIdListOutput);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};