import {Router} from "express";
import {loginUser} from "./handlers/loginUser.handler";
import {
    inputResultValidationMiddleware
} from "../../core/validation/input-result-validation-middleware";
import {
    isConfirmationCodeValid, isEmailValid, isEmailValidForResending, isPasswordValid, isRecoveryCodeValid,
    validateLoginInputData,
    validateRegistrationInputData
} from "../validation";
import {getUserInfoHandler} from "./handlers/getUserInfo.handler";
import {authMiddleware} from "../../core/middlewares/authMiddleware";
import {handleConfirmCode} from "./handlers/confirmCode.handler";
import {handleResendConfirmCode} from "./handlers/resendConfirmCode.handler";
import {registerUser} from "./handlers/registerUser.handler";
import {handleRefreshToken} from "./handlers/refreshToken.handler";
import {logoutUserHandler} from "./handlers/logoutUser.handler";
import {refreshTokenMiddleware} from "../../core/middlewares/refreshTokenMiddleware";
import {ipRateLimitMiddleware} from "../../core/middlewares/ipRateLimit.middleware";
import {handleRecoverPassword} from "./handlers/handleRecoverPassword.handler";
import {handleConfirmRecoveryPassword} from "./handlers/handleConfirmRecoveryPassword.handler";

export const authRouter = Router({});

authRouter.get('/me', authMiddleware, getUserInfoHandler);
authRouter.post('/login', ipRateLimitMiddleware, validateLoginInputData, inputResultValidationMiddleware, loginUser);
authRouter.post('/logout', refreshTokenMiddleware, logoutUserHandler);
authRouter.post('/refresh-token', refreshTokenMiddleware, handleRefreshToken);
authRouter.post('/registration', ipRateLimitMiddleware, validateRegistrationInputData, inputResultValidationMiddleware, registerUser);
authRouter.post('/registration-confirmation', ipRateLimitMiddleware, isConfirmationCodeValid, inputResultValidationMiddleware, handleConfirmCode);
authRouter.post('/password-recovery', ipRateLimitMiddleware, isEmailValidForResending, inputResultValidationMiddleware, handleRecoverPassword);
authRouter.post('/password-recovery-confirmation', ipRateLimitMiddleware, isRecoveryCodeValid, isPasswordValid, inputResultValidationMiddleware, handleConfirmRecoveryPassword);
authRouter.post('/registration-email-resending', ipRateLimitMiddleware, isEmailValidForResending, inputResultValidationMiddleware, handleResendConfirmCode);
