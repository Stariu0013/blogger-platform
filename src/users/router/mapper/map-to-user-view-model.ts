import {UserViewModel} from "../../types/types.dto";
import {WithId} from "mongodb";

export const mapToUserViewModel = (user: WithId<UserViewModel>) => {
    return {
        id: user._id.toString(),
        email: user.email,
        login: user.login,
        createdAt: user.createdAt,
    }
}