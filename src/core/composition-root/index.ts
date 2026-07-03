import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../types/di-tokens'
import {BcryptService} from '../helpers/bcrypt'

export const coreContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<BcryptService>(TYPES.BcryptService).to(BcryptService).inSingletonScope()
})
