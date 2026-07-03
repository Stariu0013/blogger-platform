import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {EmailManager} from '../manager/email.manager'
import {EmailService} from '../service/email.service'

export const emailsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<EmailManager>(TYPES.EmailManager).to(EmailManager).inSingletonScope()
    bind<EmailService>(TYPES.EmailService).to(EmailService).inSingletonScope()
})
