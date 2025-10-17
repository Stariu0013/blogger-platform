import {usersRepository} from "../repository/usersRepository";
import {UserInputModel, UserViewModel} from "../types/types.dto";
import {WithId} from "mongodb";

export const usersService = {
    async createUser(user: UserInputModel): Promise<void> {
        return await usersRepository.createUser(user);
    },
    async findUserById(id: string): Promise<WithId<UserViewModel> | null> {
        return await usersRepository.findUserById(id);
    },
    async deleteUserById(id: string): Promise<void> {
        return await usersRepository.deleteUserById(id);
    }
}