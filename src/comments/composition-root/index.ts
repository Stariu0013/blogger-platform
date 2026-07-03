import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {CommentsRepository} from '../repositories/comments.repository'
import {CommentsQueryRepository} from '../repositories/comments.query-repository'
import {CommentsService} from '../application/comments.service'

export const commentsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<CommentsRepository>(TYPES.CommentsRepository).to(CommentsRepository).inSingletonScope()
    bind<CommentsQueryRepository>(TYPES.CommentsQueryRepository).to(CommentsQueryRepository).inSingletonScope()
    bind<CommentsService>(TYPES.CommentsService).to(CommentsService).inSingletonScope()
})
