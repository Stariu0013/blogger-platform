import {PaginationAndSorting} from "../types/pagination-and-sorting";
import {
    paginationAndSortingDefault
} from "../middlewares/validation/query-pagination-and-sorting.validation-middleware";

export function setDefaultSortAndPagination<P = string>(
query: Partial<PaginationAndSorting<P>>
) {
    return {
        ...paginationAndSortingDefault,
        ...query,
        sortBy: (query.sortBy ?? paginationAndSortingDefault.sortBy) as P,
    }
}