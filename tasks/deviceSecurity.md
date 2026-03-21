# Security Devices — Implementation Plan

## Feature Overview

Manage user sessions (devices) via refresh token. Each login creates a session identified by a `deviceId` stored in the refresh token JWT payload.

### Endpoints
- `GET /api/security/devices` — list all active sessions for current user
- `DELETE /api/security/devices` — delete all sessions except current
- `DELETE /api/security/devices/:deviceId` — delete specific session

---

## Iterations

### Iteration 1 — Types + DB + Routes

**Goal:** Scaffold all new types and wire up the new collection and route constant.

**Files:**

1. **`src/security/types/security.types.ts`** _(new)_
   ```typescript
   type DeviceSession = {
       deviceId: string       // UUID
       userId: string
       ip: string
       title: string          // from user-agent header, default 'Unknown device'
       lastActiveDate: string // ISO datetime, updated on each refresh
       expiresAt: Date        // stored for future TTL cleanup
   }

   type DeviceViewModel = {
       ip: string
       title: string
       lastActiveDate: string
       deviceId: string
   }
   ```

2. **`src/core/db/mongo.db.ts`** _(modify)_
   - Import `DeviceSession`
   - Add `export let sessionsCollection: Collection<DeviceSession>`
   - Add constant `SESSIONS_COLLECTION_NAME = "sessions"`
   - Initialize `sessionsCollection` in `runDB()`

3. **`src/core/routes/index.ts`** _(modify)_
   - Add `SECURITY = "/api/security"` to `APP_ROUTES` enum

4. **`src/core/types/types.d.ts`** _(modify)_
   - Add `deviceId: string | null` to `Express.Request` interface

---

### Iteration 2 — JWT Service: add `deviceId` to refresh token

**Goal:** Embed `deviceId` in the refresh token payload so it can be extracted in middleware and handlers.

**File:** `src/auth/services/jwtService.ts` _(modify)_

- Change `createRefreshToken(userId: string)` → `createRefreshToken(userId: string, deviceId: string)`
- Include `deviceId` in the JWT payload alongside `userId`
- `verifyRefreshToken` needs no changes — already returns full decoded payload

---

### Iteration 3 — Security Repositories

**Goal:** Data access layer for sessions.

**`src/security/repositories/security.repository.ts`** _(new, class pattern)_

```typescript
class SecurityRepository {
    async createSession(session: DeviceSession): Promise<void>
    async updateLastActiveDate(deviceId: string, lastActiveDate: string, expiresAt: Date): Promise<void>
    async deleteSessionByDeviceId(deviceId: string): Promise<boolean>
    async deleteAllSessionsExceptCurrent(userId: string, deviceId: string): Promise<void>
}
export default new SecurityRepository()
```

**`src/security/repositories/security.query-repository.ts`** _(new, object literal pattern)_

```typescript
export const securityQueryRepository = {
    async findSessionsByUserId(userId: string): Promise<DeviceSession[]>
    async findSessionByDeviceId(deviceId: string): Promise<DeviceSession | null>
}
```

---

### Iteration 4 — Security Application Layer

**Goal:** Business logic for all three endpoints.

**`src/security/application/security.application.ts`** _(new)_

```typescript
export const securityService = {
    async getDevices(userId: string): Promise<Result<DeviceViewModel[]>>
    // → find all sessions for userId, map to DeviceViewModel

    async deleteAllOtherSessions(userId: string, currentDeviceId: string): Promise<Result<null>>
    // → deleteAllSessionsExceptCurrent(userId, currentDeviceId), return 204

    async deleteDeviceSession(userId: string, targetDeviceId: string): Promise<Result<null>>
    // → find session by deviceId → ResultStatus.NotFound if missing
    // → check session.userId === userId → ResultStatus.Forbidden if not owner
    // → delete → ResultStatus.Success
}
```

---

### Iteration 5 — Security Router + Handlers

**Goal:** HTTP layer for the security module.

**`src/security/router/mapper/map-to-device-view-model.ts`** _(new)_
```typescript
export const mapToDeviceViewModel = (session: DeviceSession): DeviceViewModel => ({
    ip: session.ip,
    title: session.title,
    lastActiveDate: session.lastActiveDate,
    deviceId: session.deviceId,
})
```

**`src/security/router/handlers/get-devices.handler.ts`** _(new)_
- Calls `securityService.getDevices(req.user!._id.toString())`
- Returns 200 with `DeviceViewModel[]`

**`src/security/router/handlers/delete-all-devices.handler.ts`** _(new)_
- Calls `securityService.deleteAllOtherSessions(userId, req.deviceId!)`
- Returns 204

**`src/security/router/handlers/delete-device.handler.ts`** _(new)_
- Calls `securityService.deleteDeviceSession(userId, req.params.deviceId)`
- Returns 204 on success, 403 on Forbidden, 404 on NotFound

**`src/security/router/index.ts`** _(new)_
```typescript
securityRouter.get('/devices', refreshTokenMiddleware, getDevicesHandler)
securityRouter.delete('/devices', refreshTokenMiddleware, deleteAllDevicesHandler)
securityRouter.delete('/devices/:deviceId', refreshTokenMiddleware, deleteDeviceHandler)
```

**`src/setupApp.ts`** _(modify)_
- Mount `securityRouter` at `APP_ROUTES.SECURITY`

---

### Iteration 6 — Update Auth Flow

**Goal:** Login creates a session, refresh updates it, logout deletes it.

**`src/auth/application/auth.application.ts`** _(modify)_

- **`loginUser(loginOrEmail, password, ip, userAgent)`**
  - Generate `deviceId = randomUUID()`
  - Set `lastActiveDate = new Date().toISOString()`
  - Compute `expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_TIME * 1000)`
  - Call `securityRepository.createSession({ deviceId, userId, ip, title: userAgent || 'Unknown device', lastActiveDate, expiresAt })`
  - Call `jwtService.createRefreshToken(userId, deviceId)` ← updated signature

- **`refreshToken(token, user)`**
  - Decode token to extract `deviceId`
  - Find session by `deviceId` → 401 if not found
  - Update `lastActiveDate` + `expiresAt` on session
  - Blacklist old token (keep existing mechanism)
  - Issue new tokens with the **same** `deviceId`

- **`logoutUser(token)`**
  - Decode to extract `deviceId`
  - Delete session by `deviceId`
  - Blacklist token (keep existing mechanism)

**`src/auth/router/handlers/loginUser.handler.ts`** _(modify)_
- Pass `req.ip` and `req.headers['user-agent']` to `authService.loginUser`
- `user-agent` only read at login (not on other requests per requirements)

---

### Iteration 7 — Update `refreshTokenMiddleware`

**Goal:** Validate that the session (device) still exists in DB; set `req.deviceId` for downstream use.

**`src/core/middlewares/refreshTokenMiddleware.ts`** _(modify)_

After `verifyRefreshToken` succeeds:
1. Extract `deviceId` from decoded payload
2. Call `securityQueryRepository.findSessionByDeviceId(deviceId)` → 401 if not found
3. Set `req.deviceId = deviceId`
4. Keep existing blacklist check (guards against token replay during rotation window)

---

### Iteration 8 — Tests

**`__tests__/e2e/security.test.ts`** _(new)_

| # | Test case | Expected |
|---|---|---|
| 1 | Login → `GET /security/devices` | Returns array with 1 session |
| 2 | Second login from same user → `GET /security/devices` | Returns 2 sessions |
| 3 | `DELETE /security/devices` with current refresh token | 204; only current session remains |
| 4 | `DELETE /security/devices/:deviceId` for own session | 204 |
| 5 | `DELETE /security/devices/:deviceId` for another user's session | 403 |
| 6 | `DELETE /security/devices/:deviceId` for non-existent deviceId | 404 |
| 7 | After logout, old refresh token rejected | 401 |
| 8 | After `DELETE /security/devices`, other sessions' refresh tokens rejected | 401 |

---

## Key Decisions

| Question | Decision |
|---|---|
| Session lookup vs blacklist | Keep blacklist for refresh token rotation; add session lookup in `refreshTokenMiddleware` for device-level invalidation |
| `deviceId` on Request | Add `deviceId: string \| null` to `Express.Request` in `types.d.ts` |
| IP source | `req.ip` (Express built-in) |
| user-agent fallback | `'Unknown device'` |
| user-agent usage | Only read at login, not on refresh/logout/other requests |
| Refresh token rotation | Same `deviceId` reused across refreshes — one active session per device |
| Session cleanup | `expiresAt` stored; actual cleanup via MongoDB TTL index is out of scope for now |
