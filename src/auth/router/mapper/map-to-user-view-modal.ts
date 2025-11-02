import {UserViewModel} from "../../../users/types/types.dto";
import {WithId} from "mongodb";

export const mapToUserViewModal = (user: WithId<UserViewModel>) => {
    return {
        login: user.login,
        email: user.email,
        userId: user._id
    }
};