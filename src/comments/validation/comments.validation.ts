import {body, param} from "express-validator";

export const validationCommentsInputData = [
    body('content').trim().isString().withMessage('Content must be a string').isLength({min: 20, max: 300}).withMessage('Content must be between 20 and 300 characters'),
];

export const isCommentIdValid = param('commentId').exists().withMessage('commentId must be provided').isString().withMessage('commentId must be a string');