import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {PostsQueryInput} from "../input/posts-query.input";
import {mapToPostsListMappedOutput} from "../mapper/map-to-posts-list-mapped-output";
import {postsQueryRepository} from "../../repositories/posts-query.repository";

export const getPostsListHandler = async (req: Request, res: Response) => {
    try {
        const queryInput = setDefaultSortAndPagination(req.query as unknown as PostsQueryInput);

        const {totalCount, items} = await postsQueryRepository.findMany(queryInput);

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