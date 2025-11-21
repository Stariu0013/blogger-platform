import {usersRepository} from "../repository/usersRepository";
import {User} from "../instance/User.instance";

export const usersService = {
    async createUser(user: User): Promise<void> {
        return await usersRepository.createUser(user);
    },
    async deleteUserById(id: string): Promise<void> {
        return await usersRepository.deleteUserById(id);
    }
}