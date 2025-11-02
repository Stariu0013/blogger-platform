import {Router} from "express";
import {authMiddleware} from "../../core/middlewares/authMiddleware";
import {isCommentIdValid, validationCommentsInputData} from "../validation/comments.validation";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {deleteCommentById} from "./handlers/delete-comment-by-id.handler";
import {getCommentByPostIdHandler} from "./handlers/get-comment-by-post-id.handler";
import {updateCommentById} from "./handlers/update-comment-by-id";

export const commentRouter = Router({});

commentRouter.get('/:commentId', authMiddleware, isCommentIdValid, inputResultValidationMiddleware, getCommentByPostIdHandler)
commentRouter.put('/:commentId', authMiddleware, validationCommentsInputData, isCommentIdValid, inputResultValidationMiddleware, updateCommentById)
commentRouter.delete('/:commentId', authMiddleware, isCommentIdValid, inputResultValidationMiddleware, deleteCommentById)