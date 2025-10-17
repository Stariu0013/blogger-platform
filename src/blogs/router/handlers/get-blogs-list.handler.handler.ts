import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {BlogsQueryInput} from "../input/blogs-query.input";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {mapToBlogsListMappedOutput} from "../mapper/map-to-blogs-list-mapped-output";
import {blogsQueryRepository} from "../../repositories/blogs-query.repository";

export const getBlogsListHandlerHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const queryInput = setDefaultSortAndPagination(req.query as unknown as BlogsQueryInput);

        const {totalCount, items} = await blogsQueryRepository.findMany(queryInput);

        const blogsListOutput = mapToBlogsListMappedOutput(items, {
            totalCount,
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize
        });

        res.status(HttpStatuses.OK).send(blogsListOutput);
    } catch (e) {
        console.error('Error', e);
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};