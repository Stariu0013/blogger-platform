import {Router} from "express";
import {getBlogsListHandler} from "./handlers/get-blogs-list.handler";
import {getBlogByIdHandler} from "./handlers/get-blog-by-id.handler";
import {createBlogHandler} from "./handlers/create-blog.handler";
import {deleteBlogHandler} from "./handlers/delete-blog.handler";
import {updateBlogHandler} from "./handlers/update-blog.handler";
import {isIdValid, validateBlogsInputData} from "../validation/blogs.validation";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";

const blogsRouter = Router({});

blogsRouter
    .get("/", getBlogsListHandler)
    .get("/:id", isIdValid, inputResultValidationMiddleware, getBlogByIdHandler)
    .post('/', superAdminGuardMiddleware, validateBlogsInputData, inputResultValidationMiddleware, createBlogHandler)
    .put('/:id', superAdminGuardMiddleware, validateBlogsInputData, inputResultValidationMiddleware, updateBlogHandler)
    .delete('/:id', isIdValid, superAdminGuardMiddleware, deleteBlogHandler)

export default blogsRouter;