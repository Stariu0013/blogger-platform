import {
    NextFunction,
    Request,
    Response
} from "express";
import {FieldValidationError, ValidationError, validationResult} from "express-validator";
import {ErrorMessage} from "../types/error-message";
import {HttpStatuses} from "../types/http-statuses";

const formatErrors = (error: ValidationError): ErrorMessage => {
    const expressError = error as unknown as FieldValidationError;

    return {
        field: expressError.path,
        message: expressError.msg,
    };
};

export const inputResultValidationMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req)
        .formatWith(formatErrors)
        .array({ onlyFirstError: true });


    if (errors.length > 0) {
        res.status(HttpStatuses.BAD_REQUEST).json({ errorsMessages: errors });
        return;
    }

    next();
};