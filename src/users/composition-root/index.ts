import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {UsersRepository} from '../repository/usersRepository'
import {UsersQueryRepository} from '../repository/usersQueryRepository'
import {UsersService} from '../application/usersService'

export const usersContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope()
    bind<UsersQueryRepository>(TYPES.UsersQueryRepository).to(UsersQueryRepository).inSingletonScope()
    bind<UsersService>(TYPES.UsersService).to(UsersService).inSingletonScope()
})
