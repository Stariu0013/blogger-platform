import {body} from "express-validator";
import {usersQueryRepository} from "../../users/repository/usersQueryRepository";

export const validateLoginInputData = [
    body('loginOrEmail').trim().isString().withMessage('Login or email must be a string').isLength({min: 3}).withMessage('Login or email must be 3 characters or more'),
    body('password').trim().isString().withMessage('Password must be a string').isLength({min: 6}).withMessage('Password must be 6 characters or more'),
];
export const isConfirmationCodeValid = body('code').trim().isString().withMessage('Confirmation code must be a string').isLength({min: 6}).withMessage('Confirmation code must be 6 characters or more');
export const isEmailValid = body('email').trim().isString().withMessage('Email must be a string')
    .isLength({min: 3}).withMessage('Email must be 3 characters or more')
    .isEmail().withMessage('Invalid email format')
    .custom(async (email: string) => {
        const user = await usersQueryRepository.findByLoginOrEmail(email);
        if (user) {
            throw new Error('Email already exists');
        }

        return true;
    });
export const isLoginValid = body('login').trim().isString().withMessage('Login must be a string')
    .isLength({min: 3}).withMessage('Login must be 3 characters or more')
    .custom(async (login: string) => {
        const user = await usersQueryRepository.findByLoginOrEmail(login);
        if (user) {
            throw new Error('Login already exists');
        }
        return true;
    });
export const isEmailValidForResending = body('email').trim().isString().withMessage('Email must be a string')
    .isLength({min: 3}).withMessage('Email must be 3 characters or more')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .isEmail().withMessage('Invalid email format');

export const validateRegistrationInputData = [
    isLoginValid,
    isEmailValid,
    body('password').trim().isString().withMessage('Password must be a string').isLength({min: 6, max: 21}).withMessage('Password must be 6-21 characters long'),
];