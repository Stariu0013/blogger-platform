import {PaginationAndSorting} from "../types/pagination-and-sorting";
import {
    paginationAndSortingDefault
} from "../middlewares/validation/query-pagination-and-sorting.validation-middleware";

export function setDefaultSortAndPagination<P = string>(
    query: Partial<PaginationAndSorting<P>>
): PaginationAndSorting<P> {
    return {
        ...paginationAndSortingDefault,
        ...query,
        pageSize: typeof query.pageSize !== 'number'
            ? isNaN(Number(query.pageSize))
                ? paginationAndSortingDefault.pageSize
                : Number(query.pageSize)
            : query.pageSize,
        sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
    }
}