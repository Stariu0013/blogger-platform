import {Router} from "express";
import {getUsersListHandler} from "./handlers/get-users-list.handler";
import {
    paginationAndSortValidation
} from "../../core/middlewares/validation/query-pagination-and-sorting.validation-middleware";
import {createUserHandler} from "./handlers/create-user.handler";
import {UsersSortFieldInput} from "./input/users-sort-field";
import {superAdminGuardMiddleware} from "../../auth/middlewares/super-admin.guard-middleware";
import {inputResultValidationMiddleware} from "../../core/validation/input-result-validation-middleware";
import {validateUserInputData} from "../validation/users.validation";
import {isIdValid} from "../validation/users.validation";
import {deleteUserByIdHandler} from "./handlers/delete-user-by-id.handler";

const usersRouter = Router({});

usersRouter.get('/', paginationAndSortValidation(UsersSortFieldInput), getUsersListHandler);
usersRouter.post('/', superAdminGuardMiddleware, validateUserInputData, inputResultValidationMiddleware, createUserHandler);
usersRouter.delete('/:id', superAdminGuardMiddleware, isIdValid, inputResultValidationMiddleware, deleteUserByIdHandler);

export default usersRouter;