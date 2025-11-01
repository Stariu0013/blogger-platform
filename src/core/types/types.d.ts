import {UserViewModel} from "../../users/types/types.dto";

declare global {
    namespace Express {
        export interface Request {
            user: UserViewModel | null
        }
    }
}