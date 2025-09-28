import {body} from 'express-validator';

const isTitleValid = body('title')
    .isString().withMessage('Title must be a string')
    .trim().isLength({min: 1, max: 30}).withMessage('Name must be between 1 and 30 characters')
;
const isShortDescriptionValid = body('shortDescription')
    .isString().withMessage('ShortDescription must be a string')
    .trim().isLength({min: 1, max: 100}).withMessage('Description must be between 1 and 100 characters')
;
const isContentValid = body('content')
    .isString().withMessage('Content must be a string')
    .trim().isLength({min: 1, max: 1000}).withMessage('Description must be between 1 and 1000 characters')
;

export const isBlogIdValid = body('blogId')
    .exists().withMessage('blogId must be provided')
    .isString().withMessage('blogId must be a string')
;

export const validatePostsInputData = [
    isTitleValid,
    isShortDescriptionValid,
    isContentValid,
];