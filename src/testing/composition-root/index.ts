import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {TestingRepository} from '../repositories/testing.repository'

export const testingContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<TestingRepository>(TYPES.TestingRepository).to(TestingRepository).inSingletonScope()
})
