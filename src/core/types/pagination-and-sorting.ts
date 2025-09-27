import {SortDirection} from "./sort-direction";

export type PaginationAndSorting<S> = {
    sortDirection: SortDirection;
    pageNumber: number;
    pageSize: number;
    sortBy: S;
}