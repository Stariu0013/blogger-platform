import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {PostsRepository} from '../repositories/posts.repository'
import {PostsQueryRepository} from '../repositories/posts-query.repository'
import {PostsService} from '../application/posts.application'

export const postsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<PostsRepository>(TYPES.PostsRepository).to(PostsRepository).inSingletonScope()
    bind<PostsQueryRepository>(TYPES.PostsQueryRepository).to(PostsQueryRepository).inSingletonScope()
    bind<PostsService>(TYPES.PostsService).to(PostsService).inSingletonScope()
})
