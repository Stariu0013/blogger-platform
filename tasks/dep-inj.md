# Dependency Injection Implementation Plan

## Phase 1 — Manual DI (completed)

All classes converted to constructor injection. Per-module `composition-root/index.ts` files wire instances manually. Global `src/composition-root/index.ts` re-exports everything.

---

## Phase 2 — InversifyJS Container (this phase)

Replace manual `new Foo(dep1, dep2)` wiring with an Inversify `ContainerModule` per module and a single global `Container` that loads all modules.

### What changes

| File | Change |
|---|---|
| `package.json` | add `inversify`, `reflect-metadata` |
| `tsconfig.json` | enable `experimentalDecorators`, `emitDecoratorMetadata` |
| `src/index.ts` | import `reflect-metadata` at top |
| `src/core/types/di-tokens.ts` | new — all `Symbol.for` DI tokens |
| Every class file | add `@injectable()` + `@inject(TYPES.X)` per constructor param |
| `<module>/composition-root/index.ts` | replace manual `new` with `ContainerModule` |
| `src/composition-root/index.ts` | create `Container`, load all modules, export instances |

---

## DI Tokens

**`src/core/types/di-tokens.ts`** — single source of truth for all tokens:

```ts
export const TYPES = {
    // core
    BcryptService:          Symbol.for('BcryptService'),
    // emails
    EmailManager:           Symbol.for('EmailManager'),
    EmailService:           Symbol.for('EmailService'),
    // users
    UsersRepository:        Symbol.for('UsersRepository'),
    UsersQueryRepository:   Symbol.for('UsersQueryRepository'),
    UsersService:           Symbol.for('UsersService'),
    // blogs
    BlogsRepository:        Symbol.for('BlogsRepository'),
    BlogsQueryRepository:   Symbol.for('BlogsQueryRepository'),
    BlogsService:           Symbol.for('BlogsService'),
    // posts
    PostsRepository:        Symbol.for('PostsRepository'),
    PostsQueryRepository:   Symbol.for('PostsQueryRepository'),
    PostsService:           Symbol.for('PostsService'),
    // comments
    CommentsRepository:     Symbol.for('CommentsRepository'),
    CommentsQueryRepository:Symbol.for('CommentsQueryRepository'),
    CommentsService:        Symbol.for('CommentsService'),
    // security
    SecurityRepository:     Symbol.for('SecurityRepository'),
    SecurityQueryRepository:Symbol.for('SecurityQueryRepository'),
    SecurityService:        Symbol.for('SecurityService'),
    // auth
    AuthRepository:         Symbol.for('AuthRepository'),
    AuthQueryRepository:    Symbol.for('AuthQueryRepository'),
    JwtService:             Symbol.for('JwtService'),
    AuthService:            Symbol.for('AuthService'),
    // testing
    TestingRepository:      Symbol.for('TestingRepository'),
}
```

---

## Class Decoration

### Classes with no injected dependencies

```ts
import {injectable} from 'inversify'

@injectable()
export class BcryptService {
    hashPassword(password: string): string { ... }
    async comparePasswords(plain: string, hash: string): Promise<boolean> { ... }
}
```

Same pattern for: `EmailManager`, `UsersRepository`, `UsersQueryRepository`,
`BlogsRepository`, `BlogsQueryRepository`, `PostsRepository`, `PostsQueryRepository`,
`CommentsRepository`, `CommentsQueryRepository`, `SecurityRepository`,
`SecurityQueryRepository`, `AuthRepository`, `AuthQueryRepository`,
`JwtService`, `TestingRepository`.

### Classes with injected dependencies

```ts
import {injectable, inject} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'

@injectable()
export class EmailService {
    constructor(
        @inject(TYPES.EmailManager) private emailManager: EmailManager,
    ) {}
    // ...
}

@injectable()
export class UsersService {
    constructor(
        @inject(TYPES.UsersRepository) private usersRepository: UsersRepository,
    ) {}
    // ...
}

@injectable()
export class BlogsService {
    constructor(
        @inject(TYPES.BlogsRepository)      private blogsRepository: BlogsRepository,
        @inject(TYPES.BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    ) {}
    // ...
}

@injectable()
export class PostsService {
    constructor(
        @inject(TYPES.PostsRepository)      private postsRepository: PostsRepository,
        @inject(TYPES.PostsQueryRepository) private postsQueryRepository: PostsQueryRepository,
        @inject(TYPES.BlogsQueryRepository) private blogsQueryRepository: BlogsQueryRepository,
    ) {}
    // ...
}

@injectable()
export class CommentsService {
    constructor(
        @inject(TYPES.CommentsRepository) private commentsRepository: CommentsRepository,
    ) {}
    // ...
}

@injectable()
export class SecurityService {
    constructor(
        @inject(TYPES.SecurityRepository)      private securityRepository: SecurityRepository,
        @inject(TYPES.SecurityQueryRepository) private securityQueryRepository: SecurityQueryRepository,
    ) {}
    // ...
}

@injectable()
export class AuthService {
    constructor(
        @inject(TYPES.UsersQueryRepository)    private usersQueryRepository: UsersQueryRepository,
        @inject(TYPES.UsersRepository)         private usersRepository: UsersRepository,
        @inject(TYPES.BcryptService)           private bcryptService: BcryptService,
        @inject(TYPES.EmailService)            private emailService: EmailService,
        @inject(TYPES.JwtService)              private jwtService: JwtService,
        @inject(TYPES.SecurityRepository)      private securityRepository: SecurityRepository,
        @inject(TYPES.SecurityQueryRepository) private securityQueryRepository: SecurityQueryRepository,
        @inject(TYPES.AuthRepository)          private authRepository: AuthRepository,
    ) {}
    // ...
}
```

---

## Module Composition Roots

Each `<module>/composition-root/index.ts` exports a `ContainerModule` that binds
the module's own classes. Cross-module tokens (e.g. `TYPES.UsersRepository` in
`PostsService`) are resolved at global-container level — no cross-module imports
needed in module-level roots.

### core

```ts
// src/core/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../types/di-tokens'
import {BcryptService} from '../helpers/bcrypt'

export const coreContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<BcryptService>(TYPES.BcryptService).to(BcryptService)
})
```

### emails

```ts
// src/emails/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {EmailManager} from '../manager/email.manager'
import {EmailService} from '../service/email.service'

export const emailsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<EmailManager>(TYPES.EmailManager).to(EmailManager)
    bind<EmailService>(TYPES.EmailService).to(EmailService)
})
```

### users

```ts
// src/users/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {UsersRepository} from '../repository/usersRepository'
import {UsersQueryRepository} from '../repository/usersQueryRepository'
import {UsersService} from '../application/usersService'

export const usersContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository)
    bind<UsersQueryRepository>(TYPES.UsersQueryRepository).to(UsersQueryRepository)
    bind<UsersService>(TYPES.UsersService).to(UsersService)
})
```

### blogs

```ts
// src/blogs/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {BlogsRepository} from '../repositories/blogs.repository'
import {BlogsQueryRepository} from '../repositories/blogs-query.repository'
import {BlogsService} from '../application/blogs.application'

export const blogsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<BlogsRepository>(TYPES.BlogsRepository).to(BlogsRepository)
    bind<BlogsQueryRepository>(TYPES.BlogsQueryRepository).to(BlogsQueryRepository)
    bind<BlogsService>(TYPES.BlogsService).to(BlogsService)
})
```

### posts

```ts
// src/posts/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {PostsRepository} from '../repositories/posts.repository'
import {PostsQueryRepository} from '../repositories/posts-query.repository'
import {PostsService} from '../application/posts.application'

export const postsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<PostsRepository>(TYPES.PostsRepository).to(PostsRepository)
    bind<PostsQueryRepository>(TYPES.PostsQueryRepository).to(PostsQueryRepository)
    bind<PostsService>(TYPES.PostsService).to(PostsService)
})
```

### comments

```ts
// src/comments/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {CommentsRepository} from '../repositories/comments.repository'
import {CommentsQueryRepository} from '../repositories/comments.query-repository'
import {CommentsService} from '../application/comments.service'

export const commentsContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<CommentsRepository>(TYPES.CommentsRepository).to(CommentsRepository)
    bind<CommentsQueryRepository>(TYPES.CommentsQueryRepository).to(CommentsQueryRepository)
    bind<CommentsService>(TYPES.CommentsService).to(CommentsService)
})
```

### security

```ts
// src/security/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {SecurityRepository} from '../repositories/security.repository'
import {SecurityQueryRepository} from '../repositories/security.query-repository'
import {SecurityService} from '../application/security.application'

export const securityContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<SecurityRepository>(TYPES.SecurityRepository).to(SecurityRepository)
    bind<SecurityQueryRepository>(TYPES.SecurityQueryRepository).to(SecurityQueryRepository)
    bind<SecurityService>(TYPES.SecurityService).to(SecurityService)
})
```

### auth

```ts
// src/auth/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {AuthRepository} from '../repositories/auth.repository'
import {AuthQueryRepository} from '../repositories/auth.query-repository'
import {JwtService} from '../services/jwtService'
import {AuthService} from '../application/auth.application'

export const authContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<AuthRepository>(TYPES.AuthRepository).to(AuthRepository)
    bind<AuthQueryRepository>(TYPES.AuthQueryRepository).to(AuthQueryRepository)
    bind<JwtService>(TYPES.JwtService).to(JwtService)
    bind<AuthService>(TYPES.AuthService).to(AuthService)
})
```

### testing

```ts
// src/testing/composition-root/index.ts
import {ContainerModule, interfaces} from 'inversify'
import {TYPES} from '../../core/types/di-tokens'
import {TestingRepository} from '../repositories/testing.repository'

export const testingContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<TestingRepository>(TYPES.TestingRepository).to(TestingRepository)
})
```

---

## Global Composition Root

```ts
// src/composition-root/index.ts
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

export const bcryptService          = container.get<BcryptService>(TYPES.BcryptService)
export const emailService           = container.get<EmailService>(TYPES.EmailService)
export const usersRepository        = container.get<UsersRepository>(TYPES.UsersRepository)
export const usersQueryRepository   = container.get<UsersQueryRepository>(TYPES.UsersQueryRepository)
export const usersService           = container.get<UsersService>(TYPES.UsersService)
export const blogsRepository        = container.get<BlogsRepository>(TYPES.BlogsRepository)
export const blogsQueryRepository   = container.get<BlogsQueryRepository>(TYPES.BlogsQueryRepository)
export const blogsService           = container.get<BlogsService>(TYPES.BlogsService)
export const postsRepository        = container.get<PostsRepository>(TYPES.PostsRepository)
export const postsQueryRepository   = container.get<PostsQueryRepository>(TYPES.PostsQueryRepository)
export const postsService           = container.get<PostsService>(TYPES.PostsService)
export const commentsRepository     = container.get<CommentsRepository>(TYPES.CommentsRepository)
export const commentsQueryRepository = container.get<CommentsQueryRepository>(TYPES.CommentsQueryRepository)
export const commentsService        = container.get<CommentsService>(TYPES.CommentsService)
export const securityRepository     = container.get<SecurityRepository>(TYPES.SecurityRepository)
export const securityQueryRepository = container.get<SecurityQueryRepository>(TYPES.SecurityQueryRepository)
export const securityService        = container.get<SecurityService>(TYPES.SecurityService)
export const authRepository         = container.get<AuthRepository>(TYPES.AuthRepository)
export const authQueryRepository    = container.get<AuthQueryRepository>(TYPES.AuthQueryRepository)
export const jwtService             = container.get<JwtService>(TYPES.JwtService)
export const authService            = container.get<AuthService>(TYPES.AuthService)
export const testingRepository      = container.get<TestingRepository>(TYPES.TestingRepository)
```

---

## Implementation Order

1. `npm install inversify reflect-metadata`
2. `tsconfig.json` — add `experimentalDecorators: true`, `emitDecoratorMetadata: true`
3. `src/core/types/di-tokens.ts` — create TYPES
4. Add `@injectable()` to all leaf classes (no constructor deps)
5. Add `@injectable()` + `@inject(TYPES.X)` to all service classes
6. Replace each `<module>/composition-root/index.ts` with a `ContainerModule`
7. Replace `src/composition-root/index.ts` with the global Container
8. Add `import 'reflect-metadata'` to `src/index.ts`
9. `npx tsc --noEmit` — should be clean
10. `npm run jest` — all tests should pass
