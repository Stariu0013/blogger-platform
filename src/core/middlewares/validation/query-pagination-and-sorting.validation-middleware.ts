
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
    sortFieldsEnum: Record<T, string>,
) {
    const allowedSortFields = Object.values(sortFieldsEnum);

    return [
        query('pageNumber')
            .optional()
            .default(DEFAULT_PAGE)
            .toInt()
            .isInt({ min: 1 })
            .withMessage('Page number must be a positive integer'),

        query('pageSize')
            .optional()
            .default(DEFAULT_PAGE_SIZE)
            .toInt()
            .isInt({ min: 1, max: 100 })
            .withMessage('Page size must be between 1 and 100'),

        query('sortBy')
            .optional()
            .default(Object.values(sortFieldsEnum)[0])
            .isIn(allowedSortFields)
            .withMessage(
                `Invalid sort field. Allowed values: ${allowedSortFields.join(', ')}`,
            ),

        query('sortDirection')
            .optional()
            .default(DEFAULT_SORT_DIRECTION)
            .isIn(Object.values(SortDirection))
            .withMessage(
                `Sort direction must be one of: ${Object.values(SortDirection).join(', ')}`,
            ),
    ];
}