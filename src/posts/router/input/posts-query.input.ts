import {PaginationAndSorting} from "../../../core/types/pagination-and-sorting";
import {PostsSortFieldInput} from "./posts-sort-field.input";

export type PostsQueryInput = PaginationAndSorting<PostsSortFieldInput>