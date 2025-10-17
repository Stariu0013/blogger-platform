import {Router} from "express";
import {loginUser} from "./handlers/loginUser.handler";
import {validateUserInputData} from "../../users/validation/users.validation";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";

export const authRouter = Router({});

authRouter.post('/', validateUserInputData, inputResultValidationMiddleware, loginUser);