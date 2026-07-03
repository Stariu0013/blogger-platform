import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {BlogsRepository} from '../repositories/blogs.repository'
import {BlogsQueryRepository} from '../repositories/blogs-query.repository'
import {BlogsService} from '../application/blogs.application'

export const blogsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<BlogsRepository>(TYPES.BlogsRepository).to(BlogsRepository).inSingletonScope()
    bind<BlogsQueryRepository>(TYPES.BlogsQueryRepository).to(BlogsQueryRepository).inSingletonScope()
    bind<BlogsService>(TYPES.BlogsService).to(BlogsService).inSingletonScope()
})
