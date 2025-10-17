import {body, param} from 'express-validator';

export const isIdValid = param('id')
    .exists().withMessage('id must be provided')
    .isString().withMessage('id must be a string')
;

export const validateUserInputData = [
    body('login')
        .isString()
        .withMessage('Login must be a string').trim()
        .isLength({min: 1}).withMessage('Login must be at least 1 character long'),
    body('email').trim().isEmail().withMessage('Email must be a valid email'),
    body('password').isString().withMessage('Password must be a string').trim().isLength({min: 1}).withMessage('Password must be at least 1 character long'),
]