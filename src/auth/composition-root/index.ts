import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {AuthRepository} from '../repositories/auth.repository'
import {AuthQueryRepository} from '../repositories/auth.query-repository'
import {JwtService} from '../services/jwtService'
import {AuthService} from '../application/auth.application'

export const authContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository).inSingletonScope()
    bind<AuthQueryRepository>(TYPES.AuthQueryRepository).to(AuthQueryRepository).inSingletonScope()
    bind<JwtService>(TYPES.JwtService).to(JwtService).inSingletonScope()
    bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope()
})
