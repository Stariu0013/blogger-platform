import {usersRepository} from "../repository/usersRepository";
import {UserInputModel, UserViewModel} from "../types/types.dto";
import {WithId} from "mongodb";

export const usersService = {
    async createUser(user: UserInputModel): Promise<void> {
        return await usersRepository.createUser(user);
    },
    async deleteUserById(id: string): Promise<void> {
        return await usersRepository.deleteUserById(id);
    }
}