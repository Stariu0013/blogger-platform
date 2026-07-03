import {UsersRepository} from "../repository/usersRepository";
import {User} from "../instance/User.instance";
import {injectable, inject} from "inversify";
import {TYPES} from "../../core/types/di-tokens";

@injectable()
export class UsersService {
    constructor(
        @inject(TYPES.UsersRepository) private usersRepository: UsersRepository,
    ) {}

    async createUser(user: User): Promise<void> {
        return this.usersRepository.createUser(user);
    }

    async deleteUserById(id: string): Promise<void> {
        return this.usersRepository.deleteUserById(id);
    }
}
