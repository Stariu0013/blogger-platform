import {body} from "express-validator";

export const validateLoginInputData = [
    body('loginOrEmail').trim().isString().withMessage('Login or email must be a string').isLength({min: 3}).withMessage('Login or email must be 3 characters or more'),
    body('password').trim().isString().withMessage('Password must be a string').isLength({min: 6}).withMessage('Password must be 6 characters or more'),
]