import {ResultStatus} from "./result-status";

type ExtensionType = {
    field: string | null;
    message: string;
}

export type Result<T = null> = {
    data: T;
    errorMessage?: string;
    status: ResultStatus;
    extension?: ExtensionType[];
}