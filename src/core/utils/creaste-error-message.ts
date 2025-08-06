import {ErrorMessage} from "../types/error-message";

export const createErrorMessage = (errors: ErrorMessage[]): {
    errorsMessages: ErrorMessage[]
} => {
    return {
        errorsMessages: errors,
    }
}