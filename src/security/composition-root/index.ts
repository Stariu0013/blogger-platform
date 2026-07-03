import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {SecurityRepository} from '../repositories/security.repository'
import {SecurityQueryRepository} from '../repositories/security.query-repository'
import {SecurityService} from '../application/security.application'

export const securityContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<SecurityRepository>(TYPES.SecurityRepository).to(SecurityRepository).inSingletonScope()
    bind<SecurityQueryRepository>(TYPES.SecurityQueryRepository).to(SecurityQueryRepository).inSingletonScope()
    bind<SecurityService>(TYPES.SecurityService).to(SecurityService).inSingletonScope()
})
