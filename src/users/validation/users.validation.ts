import {body, param} from 'express-validator';

export const isIdValid = param('id')
    .exists().withMessage('id must be provided')
    .isString().withMessage('id must be a string')
;

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const validateUserInputData = [
    body('login')
        .isString()
        .withMessage('Login must be a string').trim()
        .isLength({min: 3, max: 10}).withMessage('Login must be between 3 and 10 characters'),
    body('email').trim().isEmail().matches(emailRegex).withMessage('Email must be a valid email'),
    body('password').isString().withMessage('Password must be a string').trim().isLength({min: 6, max: 20}).withMessage('Password must be between 6 and 20 characters'),
]