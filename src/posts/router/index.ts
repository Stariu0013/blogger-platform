import {Router} from "express";
import {getPostsListHandler} from "./handlers/get-posts-list.handler";
import {getPostByIdHandler} from "./handlers/get-post-by-id.handler";
import {createPostHandler} from "./handlers/create-post.handler";
import {deletePostHandler} from "./handlers/delete-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {isBlogIdValid, validatePostsInputData} from "../validation/posts.validation";
import {
    paginationAndSortValidation
} from "../../core/middlewares/validation/query-pagination-and-sorting.validation-middleware";
import {PostsSortFieldInput} from "./input/posts-sort-field.input";

const postsRouter = Router({});

postsRouter
    .get("/",
        paginationAndSortValidation(PostsSortFieldInput),
        inputResultValidationMiddleware,
        getPostsListHandler
    )
    .get("/:id", isBlogIdValid, getPostByIdHandler)
    .post('/', superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, createPostHandler)
    .put('/:id', superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, updatePostHandler)
    .delete('/:id', isBlogIdValid, superAdminGuardMiddleware, deletePostHandler)

export default postsRouter;