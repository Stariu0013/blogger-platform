import {Request, Response} from 'express';
import {setDefaultSortAndPagination} from "../../../core/helpers/set-default-sort-and-pagination";
import {UsersQueryInput} from "../input/users-query.input";
import {mapToUserViewModel} from "../mapper/map-to-user-view-model";
import {mapToUsersListMappedOutput} from "../mapper/map-to-users-list-mapped-output";
import {HttpStatuses} from "../../../core/types/http-statuses";
import {UserViewModel} from "../../types/types.dto";
import {WithId} from "mongodb";
import {usersQueryRepository} from "../../repository/usersQueryRepository";

export const getUsersListHandler = async (
    req: Request,
    res: Response,
) => {
    try {
        const queryInput = setDefaultSortAndPagination(req.query as unknown as UsersQueryInput);

        const { totalCount, items } = await usersQueryRepository.findMany(queryInput);

        const mappedUsers = items.map((user: WithId<UserViewModel>) => (mapToUserViewModel(user)));
        const mappedResult = mapToUsersListMappedOutput(mappedUsers, {
            totalCount,
            page: queryInput.pageNumber,
            pageSize: queryInput.pageSize,
        });

        res.status(HttpStatuses.OK).send(mappedResult);
    } catch (e) {
        console.log('error', e);
        res.status(HttpStatuses.INTERNAL_SERVER_ERROR).send(e);
    }
};