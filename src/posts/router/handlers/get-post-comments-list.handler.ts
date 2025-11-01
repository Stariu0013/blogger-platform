import {HttpStatuses} from "../../../core/types/http-statuses";
import {Request, Response} from "express";
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {commentsQueryRepository} from "../../../comments/repositories/comments.query-repository";
import {CommentsQueryInput} from "../../../comments/input/comments-query.input";
import {mapToCommentListMappedOutput} from "../../../comments/router/mappers/map-to-comments-list-mapped-output";

export const getPostCommentsListHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;
        const queryInput = setDefaultSortAndPagination(req.query as unknown as CommentsQueryInput);

        const {totalCount, items} = await commentsQueryRepository.getAllUserComments(queryInput, userId!);

        const mappedComments = mapToCommentListMappedOutput(items, {
            totalCount: totalCount,
            pageNumber: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
        });

        res.status(HttpStatuses.OK).send(mappedComments);
    } catch (e) {
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};