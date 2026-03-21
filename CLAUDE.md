# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (compile TS in watch mode, then run with nodemon)
npm run watch   # TypeScript compiler watch mode
npm run dev     # Start dev server (nodemon on dist/src/index.js, inspector enabled)

# Testing
npm run jest              # Run all tests (isolated, detects open handles)
npm run jest:coverage     # Run tests with coverage report

# Code quality
npm run lint    # ESLint with auto-fix
npm run format  # Prettier formatting
```

To run a single test file:
```bash
npx jest __tests__/auth.test.ts
```

## Architecture

Express.js + TypeScript REST API backed by MongoDB (native driver, no ORM). Deployed on Vercel.

### Directory Structure

```
src/
├── auth/                  # Auth module
├── users/                 # Users module
├── blogs/                 # Blogs module
├── posts/                 # Posts module
├── comments/              # Comments module
├── emails/                # Email sending (nodemailer + templates)
├── testing/               # Test-only endpoints (clear DB)
├── tokenBlackList/        # Blacklist types
├── core/
│   ├── db/                # MongoDB connection + collection exports
│   ├── middlewares/       # authMiddleware, refreshTokenMiddleware, validation
│   ├── helpers/           # bcrypt, pagination, sorting utilities
│   ├── routes/            # APP_ROUTES enum
│   ├── settings/          # Env config with defaults
│   ├── types/             # Result, HttpStatuses, pagination types
│   └── utils/             # Misc helpers
├── index.ts               # Entry point
└── setupApp.ts            # Express app setup, mounts all routers
__tests__/
├── e2e/                   # End-to-end tests
├── integrate/             # Integration tests
└── utils/                 # clearDb, createNewUser, generateBasicAuthToken
```

### Module Structure

Each domain module follows the same layered pattern:
- `router/` — route definitions (`index.ts`) + `handlers/` + `mapper/`
- `application/` — business logic (service)
- `repositories/` — MongoDB data access (write repo + query repo)
- `validation/` — express-validator rules
- `types/` — DTOs, input types, view models
- `middlewares/` — module-specific guards (e.g. `super-admin.guard-middleware.ts`)
- `services/` — domain-specific services (e.g. JWT service in auth)

### Authentication

Three-tier auth system:
1. **Bearer JWT** (`authMiddleware`) — short-lived access tokens (default 10s), used for user actions (comments, `/me`). Sets `req.user` on success.
2. **Refresh token cookie** (`refreshTokenMiddleware`) — longer-lived (default 20s), httpOnly cookie; blacklist-checked on every use; old tokens added to `tokens_black_list` on logout/refresh.
3. **Basic Auth** (`superAdminGuardMiddleware`) — hardcoded admin credentials for admin CRUD on blogs, posts, users.

Auth flow: Login → access token (Bearer) + refresh token (cookie) → refresh when expired → logout blacklists refresh token.

### Database

Native MongoDB driver. Collections initialized in `src/core/db/mongo.db.ts`, exported as singletons: `postsCollection`, `blogsCollection`, `usersCollection`, `commentsCollection`, `blackListCollection`. `dropDb()` clears all collections (used in test teardown).

### Testing

Jest + supertest + `mongodb-memory-server`. Tests call `runDB()` in `beforeAll`, use `clearDb()` (hits `DELETE /testing/all-data`) between test suites. Test utils: `clearDb`, `createNewUserAndReturnAccessToken`, `generateBasicAuthToken`.

---

## Code Style

### Formatting (Prettier)

- **4-space indentation**
- **Single quotes** (not double)
- **No semicolons**
- Trailing commas everywhere (`"trailingComma": "all"`)
- 80-character line width

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files — handlers | `{action}.handler.ts` | `loginUser.handler.ts` |
| Files — repositories | `{domain}.repository.ts` / `{domain}.query-repository.ts` | `blogs.repository.ts` |
| Files — mappers | `map-to-{view-model}.ts` | `map-to-blog-view-modal.ts` |
| Files — types | `{domain}.types.ts` / `{domain}.dto.ts` / `{domain}.input-dto.ts` | `auth.types.ts` |
| Files — validation | `{domain}.validation.ts` | `blogs.validation.ts` |
| Files — query input | `{domain}-query.input.ts` | `blogs-query.input.ts` |
| Classes | PascalCase | `BlogsRepository`, `User` |
| Functions / variables | camelCase | `loginUser`, `createBlogHandler` |
| Enums | PascalCase | `ResultStatus`, `HttpStatuses`, `BlogsSortFieldInput` |
| Type/Interface names | PascalCase + suffix | `BlogViewModel`, `AuthInputType`, `BlogsQueryInput` |
| Singleton repo exports | `export default new XxxRepository()` | `export default new BlogsRepository()` |
| Object-literal repos | named export | `export const blogsQueryRepository = { ... }` |

### TypeScript Patterns

- `strict: true` — all strict checks enabled
- **Result type** for service layer returns:
  ```typescript
  type Result<T = null> = {
      data: T
      status: ResultStatus
      errorMessage?: string
      extension?: ExtensionType[]  // field-level errors: { field, message }
  }
  ```
- **Generic pagination type**: `PaginationAndSorting<S>` where `S` is a domain sort-field enum
- Query input types combine generic pagination + domain-specific filters:
  ```typescript
  type BlogsQueryInput = PaginationAndSorting<BlogsSortFieldInput> & Partial<{
      searchNameTerm: string
  }>
  ```
- MongoDB read results typed as `WithId<T>` (adds `_id: ObjectId`)
- Global `req.user` via namespace extension in `src/core/types/types.d.ts`:
  ```typescript
  declare global {
      namespace Express {
          interface Request { user: WithId<UserViewModel> | null }
      }
  }
  ```
- `new ObjectId(id)` for string → ObjectId conversion in all DB queries

---

## Patterns

### Handler Pattern

```typescript
export const loginUser = async (
    req: Request<{}, {}, AuthInputType>,
    res: Response,
) => {
    try {
        const result = await authService.loginUser(req.body.loginOrEmail, req.body.password)

        if (result.status === ResultStatus.Success && result.data) {
            res.cookie('refreshToken', result.data.refreshToken, { httpOnly: true, secure: true })
            res.status(HttpStatuses.OK).send({ accessToken: result.data.accessToken })
            return
        }

        res.status(HttpStatuses.UNAUTHORIZED).send({ errorsMessages: result.extension || [] })
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
```

Key rules:
- Always `try/catch` with 500 fallback
- Use `ResultStatus` enum to branch on service results, never throw across layers
- Use `HttpStatuses` enum (never raw numbers)
- Early `return` after each response to avoid double-send
- Extract data from `req.body` / `req.params` / `req.query` at top of handler
- Call mapper before sending entity data to client

### Repository Pattern

Two repos per domain — **write repo** (class) and **query repo** (object literal):

```typescript
// Write: class with single exported instance
class BlogsRepository {
    async createBlog(blog: BlogInputModel): Promise<WithId<BlogModel>> {
        const result = await blogsCollection.insertOne(blog)
        return { ...blog, _id: result.insertedId }
    }
    async updateBlog(id: string, blog: BlogModel): Promise<boolean> {
        const result = await blogsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...blog } },
        )
        return result.matchedCount >= 1
    }
    async deleteBlog(id: string): Promise<void> {
        const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) })
        if (result.deletedCount < 1) throw new Error('Blog not found')
    }
}
export default new BlogsRepository()

// Query: object literal with named methods; maps to view model internally
export const blogsQueryRepository = {
    async findMany(queryDto: BlogsQueryInput): Promise<{ items: BlogModel[]; totalCount: number }> {
        const filter: any = {}
        if (queryDto.searchNameTerm) {
            filter.name = { $regex: queryDto.searchNameTerm, $options: 'i' }
        }
        const items = await blogsCollection
            .find(filter)
            .sort({ [queryDto.sortBy]: queryDto.sortDirection })
            .skip(queryDto.pageSize * (queryDto.pageNumber - 1))
            .limit(queryDto.pageSize)
            .toArray()
        const totalCount = await blogsCollection.countDocuments(filter)
        return { items: items.map(mapToBlogViewModal), totalCount }
    },
}
```

### Validation Pattern

```typescript
// Individual reusable validators
const isNameValid = body('name')
    .isString().withMessage('Name must be a string')
    .trim().isLength({ min: 3, max: 15 }).withMessage('Name must be between 3 and 15 characters')

// Composed into arrays, exported for router use
export const validateBlogsInputData = [isNameValid, isDescriptionValid, isWebsiteUrlValid]

// Custom async validator for DB uniqueness
export const isEmailValid = body('email')
    .trim().isEmail().withMessage('Invalid email format')
    .custom(async (email) => {
        const user = await usersQueryRepository.findByLoginOrEmail(email)
        if (user) throw new Error('Email already exists')
        return true
    })
```

Validation error response shape:
```json
{ "errorsMessages": [{ "field": "login", "message": "Login must be 3-10 characters long" }] }
```

### Router Composition Pattern

```typescript
// Middleware stack: [param validators] → [body validators] → [inputResultValidationMiddleware] → [auth guard] → handler
postsRouter
    .get('/', paginationAndSortValidation(PostsSortFieldInput), getPostsListHandler)
    .post('/', superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, createPostHandler)
    .put('/:id', isBlogIdValid, superAdminGuardMiddleware, validatePostsInputData, inputResultValidationMiddleware, updatePostHandler)
    .delete('/:id', isBlogIdValid, superAdminGuardMiddleware, deletePostHandler)
```

### Mapper Pattern

Mappers live in `router/mapper/`, called in query repos or handlers:
```typescript
export const mapToBlogViewModal = (blog: WithId<BlogModel>) => ({
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
})
```

### Paginated Response Shape

```typescript
{
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize,
    totalCount,
    items: [...],
}
```

### Pagination/Sorting Validation (Generic)

```typescript
// In router: paginationAndSortValidation accepts a sort-field enum
postsRouter.get('/', paginationAndSortValidation(PostsSortFieldInput), getPostsListHandler)

// Sort field enums live in router/input/{domain}-sort-field.input.ts
enum PostsSortFieldInput {
    createdAt = 'createdAt',
    title = 'title',
    // ...
}
```

---

## Environment Variables

```
PORT=3000
MONGO_URL=<mongodb connection string>
DB_NAME=uber-back-education
JWT_SECRET=secret
JWT_EXPIRATION_TIME=10
REFRESH_TOKEN_SECRET=refreshTokenSecret
REFRESH_TOKEN_EXPIRATION_TIME=20
ADMIN_USERNAME=admin
ADMIN_PASSWORD=qwerty
```