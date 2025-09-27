import {SortDirection} from "../../types/sort-direction";
import {PaginationAndSorting} from "../../types/pagination-and-sorting";
import {query} from "express-validator";

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;
const DEFAULT_SORT_DIRECTION = SortDirection.Desc;
const DEFAULT_SORT_BY = 'createdAt';

export const paginationAndSortingDefault: PaginationAndSorting<string> = {
    sortDirection: DEFAULT_SORT_DIRECTION,
    pageNumber: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: DEFAULT_SORT_BY
};

export function paginationAndSortValidation<T extends string>(
    sortFieldEnum: Record<T, string>,
) {
    const allowedSortFields = Object.values(sortFieldEnum);

    return [
        query('pageNumber').optional().isInt({min: 1}).default(DEFAULT_PAGE).withMessage('Page number must be a number').toInt(),
        query('pageSize').optional().isInt({min: 1}).default(DEFAULT_PAGE_SIZE).withMessage('Page size must be a number').toInt(),
        query('sortBy').optional().isIn(allowedSortFields).default(DEFAULT_SORT_BY).withMessage('Sort by must be one of the following: ' + allowedSortFields.join(', ')),
        query('sortDirection').optional().isIn(allowedSortFields).default(DEFAULT_SORT_DIRECTION).withMessage('Sort direction must be one of the following: ' + allowedSortFields.join(', '))
    ];
}