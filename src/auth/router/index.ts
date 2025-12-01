import {Router} from "express";
import {loginUser} from "./handlers/loginUser.handler";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {
    isConfirmationCodeValid, isEmailValid, isEmailValidForResending,
    validateLoginInputData,
    validateRegistrationInputData
} from "../validation";
import {getUserInfoHandler} from "./handlers/getUserInfo.handler";
import {authMiddleware} from "../../core/middlewares/authMiddleware";
import {handleConfirmCode} from "./handlers/confirmCode.handler";
import {handleResendConfirmCode} from "./handlers/resendConfirmCode.handler";
import {registerUser} from "./handlers/registerUser.handler";

export const authRouter = Router({});

authRouter.get('/me', authMiddleware, getUserInfoHandler);
authRouter.post('/login', validateLoginInputData, inputResultValidationMiddleware, loginUser);
authRouter.post('/registration', validateRegistrationInputData, inputResultValidationMiddleware(false), registerUser);
authRouter.post('/registration-confirmation', isConfirmationCodeValid, inputResultValidationMiddleware, handleConfirmCode);
authRouter.post('/registration-email-resending', isEmailValidForResending, inputResultValidationMiddleware, handleResendConfirmCode);
