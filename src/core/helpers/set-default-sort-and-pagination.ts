import {PaginationAndSorting} from "../types/pagination-and-sorting";
import {
    paginationAndSortingDefault
} from "../middlewares/validation/query-pagination-and-sorting.validation-middleware";

export function setDefaultSortAndPagination<P = string>(
    query: Partial<PaginationAndSorting<P>>
): PaginationAndSorting<P> {
    return {
        ...query,
        pageNumber: Number(query.pageNumber) || paginationAndSortingDefault.pageNumber,
        pageSize: Number(query.pageSize) || paginationAndSortingDefault.pageSize,
        sortDirection: query.sortDirection || paginationAndSortingDefault.sortDirection,
        sortBy: (query.sortBy || paginationAndSortingDefault.sortBy) as P,
    }
}