import {PaginationAndSorting} from "../../../core/types/pagination-and-sorting";
import {UsersSortFieldInput} from "./users-sort-field";

export type UsersQueryInput = PaginationAndSorting<UsersSortFieldInput> & Partial<{
    searchLoginTerm: string;
    searchEmailTerm: string;
}>