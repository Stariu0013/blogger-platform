import {Router} from "express";
import {getBlogsListHandlerHandler} from "./handlers/get-blogs-list.handler.handler";
import {getBlogByIdHandler} from "./handlers/get-blog-by-id.handler";
import {createBlogHandler} from "./handlers/create-blog.handler";
import {deleteBlogHandler} from "./handlers/delete-blog.handler";
import {updateBlogHandler} from "./handlers/update-blog.handler";
import {isIdValid, validateBlogsInputData} from "../validation/blogs.validation";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {
    paginationAndSortValidation
} from "../../core/middlewares/validation/query-pagination-and-sorting.validation-middleware";
import {BlogsSortFieldInput} from "./input/blogs-sort-field.input";
import {getPostsByBlogIdHandler} from "./handlers/get-posts-by-blog-id.handler";
import {createPostToBlogHandler} from "./handlers/create-post-to-blog.handler";
import {PostsSortFieldInput} from "../../posts/router/input/posts-sort-field.input";
import {validatePostsInputData} from "../../posts/validation/posts.validation";

const blogsRouter = Router({});

blogsRouter
    .get("/",
        paginationAndSortValidation(BlogsSortFieldInput),
        getBlogsListHandlerHandler
    )
    .get("/:id/posts", paginationAndSortValidation(PostsSortFieldInput), isIdValid, getPostsByBlogIdHandler)
    .get("/:id", isIdValid, inputResultValidationMiddleware, getBlogByIdHandler)
    .post('/:id/posts', superAdminGuardMiddleware, isIdValid, validatePostsInputData, inputResultValidationMiddleware, createPostToBlogHandler)
    .post('/', superAdminGuardMiddleware, validateBlogsInputData, inputResultValidationMiddleware, createBlogHandler)
    .put('/:id', superAdminGuardMiddleware, validateBlogsInputData, inputResultValidationMiddleware, updateBlogHandler)
    .delete('/:id', isIdValid, superAdminGuardMiddleware, deleteBlogHandler)


export default blogsRouter;