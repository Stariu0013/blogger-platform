import {Router} from "express";
import {loginUser} from "./handlers/loginUser.handler";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {validateLoginInputData} from "../validation";
import {getUserInfoHandler} from "./handlers/getUserInfo.handler";
import {authMiddleware} from "../../core/middlewares/authMiddleware";

export const authRouter = Router({});

authRouter.get('/me', authMiddleware, getUserInfoHandler);
authRouter.post('/login', validateLoginInputData, inputResultValidationMiddleware, loginUser);
