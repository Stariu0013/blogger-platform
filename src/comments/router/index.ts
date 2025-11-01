import {Router} from "express";
import {authMiddleware} from "../../core/middlewares/authMiddleware";
import {isCommentIdValid, validationCommentsInputData} from "../validation/comments.validation";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {createCommentHandler} from "./handlers/create-comment.handler";
import {deleteCommentById} from "./handlers/delete-comment-by-id";

export const commentRouter = Router({});

commentRouter.post('/', authMiddleware, validationCommentsInputData, inputResultValidationMiddleware, createCommentHandler)
commentRouter.delete('/', authMiddleware, isCommentIdValid, inputResultValidationMiddleware, deleteCommentById)