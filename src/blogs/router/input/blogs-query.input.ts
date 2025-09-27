import {PaginationAndSorting} from "../../../core/types/pagination-and-sorting";
import {BlogsSortFieldInput} from "./blogs-sort-field.input";

export type BlogsQueryInput = PaginationAndSorting<BlogsSortFieldInput> & Partial<{
    searchNameTerm: string
}>