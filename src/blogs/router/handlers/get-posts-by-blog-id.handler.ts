import BlogsRepository from "../../repositories/blogs.repository";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogModel} from "../../types/blogs.dto";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {BlogsQueryInput} from "../input/blogs-query.input";
import {mapToBlogsListMappedOutput} from "../mapper/map-to-blogs-list-mapped-output";

export const getPostsByBlogIdHandler = async (
    req: Request<{id: string}, BlogModel, {}, {}>, res: Response
) => {
    try {
        const {id} = req.params;
        const queryInput = setDefaultSortAndPagination(req.query as unknown as BlogsQueryInput);

        const {
            items,
            totalCount,
        } = await BlogsRepository.findPostsByBlogId(id, queryInput);

        const postsByBlogIdListOutput = mapToBlogsListMappedOutput(items, {
            totalCount,
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize
        });

        res.status(HttpStatuses.OK).send(postsByBlogIdListOutput);
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR);
    }
};