import 'reflect-metadata'
import {Container} from 'inversify'
import {TYPES} from '../core/types/di-tokens'
import {BcryptService} from '../core/helpers/bcrypt'
import {EmailService} from '../emails/service/email.service'
import {UsersRepository} from '../users/repository/usersRepository'
import {UsersQueryRepository} from '../users/repository/usersQueryRepository'
import {UsersService} from '../users/application/usersService'
import {BlogsRepository} from '../blogs/repositories/blogs.repository'
import {BlogsQueryRepository} from '../blogs/repositories/blogs-query.repository'
import {BlogsService} from '../blogs/application/blogs.application'
import {PostsRepository} from '../posts/repositories/posts.repository'
import {PostsQueryRepository} from '../posts/repositories/posts-query.repository'
import {PostsService} from '../posts/application/posts.application'
import {CommentsRepository} from '../comments/repositories/comments.repository'
import {CommentsQueryRepository} from '../comments/repositories/comments.query-repository'
import {CommentsService} from '../comments/application/comments.service'
import {SecurityRepository} from '../security/repositories/security.repository'
import {SecurityQueryRepository} from '../security/repositories/security.query-repository'
import {SecurityService} from '../security/application/security.application'
import {AuthRepository} from '../auth/repositories/auth.repository'
import {AuthQueryRepository} from '../auth/repositories/auth.query-repository'
import {JwtService} from '../auth/services/jwtService'
import {AuthService} from '../auth/application/auth.application'
import {TestingRepository} from '../testing/repositories/testing.repository'
import {coreContainerModule} from '../core/composition-root'
import {emailsContainerModule} from '../emails/composition-root'
import {usersContainerModule} from '../users/composition-root'
import {blogsContainerModule} from '../blogs/composition-root'
import {postsContainerModule} from '../posts/composition-root'
import {commentsContainerModule} from '../comments/composition-root'
import {securityContainerModule} from '../security/composition-root'
import {authContainerModule} from '../auth/composition-root'
import {testingContainerModule} from '../testing/composition-root'

export const container = new Container()
container.load(
    coreContainerModule,
    emailsContainerModule,
    usersContainerModule,
    blogsContainerModule,
    postsContainerModule,
    commentsContainerModule,
    securityContainerModule,
    authContainerModule,
    testingContainerModule,
)

export const bcryptService           = container.get<BcryptService>(TYPES.BcryptService)
export const emailService            = container.get<EmailService>(TYPES.EmailService)
export const usersRepository         = container.get<UsersRepository>(TYPES.UsersRepository)
export const usersQueryRepository    = container.get<UsersQueryRepository>(TYPES.UsersQueryRepository)
export const usersService            = container.get<UsersService>(TYPES.UsersService)
export const blogsRepository         = container.get<BlogsRepository>(TYPES.BlogsRepository)
export const blogsQueryRepository    = container.get<BlogsQueryRepository>(TYPES.BlogsQueryRepository)
export const blogsService            = container.get<BlogsService>(TYPES.BlogsService)
export const postsRepository         = container.get<PostsRepository>(TYPES.PostsRepository)
export const postsQueryRepository    = container.get<PostsQueryRepository>(TYPES.PostsQueryRepository)
export const postsService            = container.get<PostsService>(TYPES.PostsService)
export const commentsRepository      = container.get<CommentsRepository>(TYPES.CommentsRepository)
export const commentsQueryRepository = container.get<CommentsQueryRepository>(TYPES.CommentsQueryRepository)
export const commentsService         = container.get<CommentsService>(TYPES.CommentsService)
export const securityRepository      = container.get<SecurityRepository>(TYPES.SecurityRepository)
export const securityQueryRepository = container.get<SecurityQueryRepository>(TYPES.SecurityQueryRepository)
export const securityService         = container.get<SecurityService>(TYPES.SecurityService)
export const authRepository          = container.get<AuthRepository>(TYPES.AuthRepository)
export const authQueryRepository     = container.get<AuthQueryRepository>(TYPES.AuthQueryRepository)
export const jwtService              = container.get<JwtService>(TYPES.JwtService)
export const authService             = container.get<AuthService>(TYPES.AuthService)
export const testingRepository       = container.get<TestingRepository>(TYPES.TestingRepository)
