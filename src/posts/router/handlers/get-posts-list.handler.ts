import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {PostsService} from "../../application/posts.application";
import {PostsQueryInput} from "../input/posts-query.input";
import {mapToPostsListMappedOutput} from "../mapper/map-to-posts-list-mapped-output";

export const getPostsListHandler = async (req: Request, res: Response) => {
    try {
        const queryInput = setDefaultSortAndPagination(req.query as unknown as PostsQueryInput);

        const {totalCount, items} = await PostsService.findMany(queryInput);

        const mappedPosts = mapToPostsListMappedOutput(items, {
            totalCount: totalCount,
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
        });

        res.status(HttpStatuses.OK).send(mappedPosts);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};