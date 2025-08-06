import {body, param} from 'express-validator';

const isNameValid = body('name')
    .isString().withMessage('Name must be a string')
    .trim().isLength({min: 3, max: 15}).withMessage('Name must be between 3 and 15 characters')
;
const isDescriptionValid = body('description')
    .isString().withMessage('Description must be a string')
    .trim().isLength({min: 1, max: 500}).withMessage('Description must be between 1 and 500 characters')
;
const isWebsiteUrlValid = body('websiteUrl')
    .isString().withMessage('websiteUrl must be a string')
    .trim().isLength({min: 1, max: 100}).withMessage('WebsiteUrl must be between 1 and 100 characters')
    .matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}(\/[a-zA-Z0-9._-]+)*\/?$/)
    .withMessage('Invalid website URL format')
;

export const isIdValid = param('id')
    .exists().withMessage('Id must be provided')
    .isString().withMessage('Id must be a string')
    .isLength({ min: 1 })
    .withMessage('ID must not be empty')
    .isNumeric()
    .withMessage('ID must be a numeric string')
;

export const validateBlogsInputData = [
    isNameValid,
    isDescriptionValid,
    isWebsiteUrlValid,
];