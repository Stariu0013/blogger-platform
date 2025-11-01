import {UserViewModel} from "../../../users/types/types.dto";

export const mapToUserViewModal = (user: UserViewModel) => {
    return {
        login: user.login,
        email: user.email,
        userId: user.id
    }
};