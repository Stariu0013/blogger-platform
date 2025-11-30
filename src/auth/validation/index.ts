import {body} from "express-validator";
import {usersQueryRepository} from "../../users/repository/usersQueryRepository";

const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const validateLoginInputData = [
    body('loginOrEmail').trim().isString().withMessage('Login or email must be a string').isLength({min: 3}).withMessage('Login or email must be 3 characters or more'),
    body('password').trim().isString().withMessage('Password must be a string').isLength({min: 6}).withMessage('Password must be 6 characters or more'),
];
export const isConfirmationCodeValid = body('code').trim().isString().withMessage('Confirmation code must be a string').isLength({min: 6}).withMessage('Confirmation code must be 6 characters or more');
export const isEmailValid = body('email').trim().isString().withMessage('Email must be a string')
    .isEmail().withMessage('Invalid email format').matches(emailPattern).withMessage('Invalid email format');

export const validateRegistrationInputData = [
    body('login').trim().isString().withMessage('Login must be a string').isLength({min: 3}).withMessage('Login must be 3 characters or more'),
    body('email').trim().isString().withMessage('Email must be a string')
        .isLength({min: 3}).withMessage('Email must be 3 characters or more')
        .isEmail().withMessage('Invalid email format')
        .custom(async (email: string) => {
            const user = await usersQueryRepository.findByLoginOrEmail(email);
            if (user) {
                throw new Error('Email already exists');
            }

            return true;
        }),
    body('password').trim().isString().withMessage('Password must be a string').isLength({min: 6}).withMessage('Password must be 6 characters or more'),
];