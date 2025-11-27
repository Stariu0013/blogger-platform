import {UserViewModel} from "../../types/types.dto";

export const mapToUsersListMappedOutput = (items: Partial<UserViewModel>[], meta: {
    page: number;
    pageSize: number;
    totalCount: number;
}) => {
    return {
        pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
        page: meta.page,
        pageSize: meta.pageSize,
        totalCount: meta.totalCount,
        items,
    }
};