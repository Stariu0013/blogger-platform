import {UserViewModel} from "../../users/types/types.dto";
import {WithId} from "mongodb";

declare global {
    namespace Express {
        export interface Request {
            user: WithId<UserViewModel> | null
        }
    }
}