import {Router} from "express";
import {loginUser} from "./handlers/loginUser.handler";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {validateLoginInputData} from "../validation";

export const authRouter = Router({});

authRouter.post('/', validateLoginInputData, inputResultValidationMiddleware, loginUser);