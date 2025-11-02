import {Router} from "express";
import {getPostsListHandler} from "./handlers/get-posts-list.handler";
import {getPostByIdHandler} from "./handlers/get-post-by-id.handler";
import {createPostHandler} from "./handlers/create-post.handler";
import {deletePostHandler} from "./handlers/delete-post.handler";
import {updatePostHandler} from "./handlers/update-post.handler";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {isBlogIdValid, isPostIdValid, validatePostsInputData} from "../validation/posts.validation";
import {
    paginationAndSortValidation
} from "../../core/middlewares/validation/query-pagination-and-sorting.validation-middleware";
import {PostsSortFieldInput} from "./input/posts-sort-field.input";
import {authMiddleware} from "../../core/middlewares/authMiddleware";
import {validationCommentsInputData} from "../../comments/validation/comments.validation";
import {createPostCommentHandler} from "./handlers/create-post-comment.handler";
import {CommentsSortFieldInput} from "../../comments/input/comments-sort-field.input";
import {getPostCommentsListHandler} from "./handlers/get-post-comments-list.handler";

const postsRouter = Router({});

postsRouter
    .get("/",
        paginationAndSortValidation(PostsSortFieldInput),
        getPostsListHandler
    )
    .get("/:postId/comments", isPostIdValid, paginationAndSortValidation(CommentsSortFieldInput), inputResultValidationMiddleware, getPostCommentsListHandler)
    .get("/:id", isBlogIdValid, getPostByIdHandler)
    .post('/', superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, createPostHandler)
    .post('/:postId/comments', authMiddleware, validationCommentsInputData, inputResultValidationMiddleware, createPostCommentHandler)
    .put('/:id', superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, updatePostHandler)
    .delete('/:id', isBlogIdValid, superAdminGuardMiddleware, deletePostHandler)

export default postsRouter;