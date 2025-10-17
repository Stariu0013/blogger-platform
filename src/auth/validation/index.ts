import {body} from "express-validator";

export const validateLoginInputData = [
    body('loginOrEmail').trim().isString().withMessage('Login or email must be a string'),
    body('password').trim().isString().withMessage('Password must be a string'),
]