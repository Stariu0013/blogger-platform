# Security Devices — How It Works

Imagine you log into Instagram on your phone, your laptop, and your tablet. Instagram knows about all three — and lets you kick any of them out if something looks suspicious. That's exactly what this feature does.

---

## The Big Idea

Every time a user logs in, we create a **session** — a record that says:

> "User John logged in from IP 192.168.1.1, using Chrome on Windows, at 10:00am."

Each session gets a unique ID called a **deviceId**. That ID travels inside the refresh token (a special cookie the browser holds onto).

When John wants to see his active sessions, or delete one he doesn't recognize — we have all the data we need.

---

## What Gets Stored

Every session is saved in the `sessions` collection in MongoDB. The TypeScript types are:

```typescript
// src/security/types/security.types.ts

export type DeviceSession = {
    deviceId: string
    userId: string
    ip: string
    title: string
    lastActiveDate: string
    expiresAt: Date
}

export type DeviceViewModel = {
    ip: string
    title: string
    lastActiveDate: string
    deviceId: string
}
```

A stored document looks like:

```json
{
  "deviceId": "a1b2c3d4-...",
  "userId": "507f1f77bcf86cd799439011",
  "ip": "192.168.1.1",
  "title": "Mozilla/5.0 (Windows NT 10.0) Chrome/120.0",
  "lastActiveDate": "2026-03-21T10:00:00.000Z",
  "expiresAt": "2026-03-21T10:00:20.000Z"
}
```

- **deviceId** — a random UUID, unique per login
- **userId** — who this session belongs to
- **ip** — where the request came from
- **title** — the browser/device name (from `User-Agent` header at login time)
- **lastActiveDate** — updated every time the user refreshes their token
- **expiresAt** — when the refresh token expires (used for future cleanup)

---

## The Endpoints

Routes are registered in `src/security/router/index.ts`:

```typescript
// src/security/router/index.ts

export const securityRouter = Router()

securityRouter.get('/devices', refreshTokenMiddleware, getDevicesHandler)
securityRouter.delete('/devices', refreshTokenMiddleware, deleteAllDevicesHandler)
securityRouter.delete('/devices/:deviceId', refreshTokenMiddleware, deleteDeviceHandler)
```

All three endpoints require a valid refresh token cookie — enforced by `refreshTokenMiddleware` before the handler runs.

---

### `GET /api/security/devices`

> "Show me all my active sessions."

**Requires:** refresh token cookie

**Handler:**

```typescript
// src/security/router/handlers/get-devices.handler.ts

export const getDevicesHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()

        const result = await securityService.getDevices(userId)

        if (result.status === ResultStatus.Success) {
            res.status(HttpStatuses.OK).send(result.data)
            return
        }

        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
```

**Service:**

```typescript
// src/security/application/security.application.ts

async getDevices(userId: string): Promise<Result<DeviceViewModel[]>> {
    const sessions = await securityQueryRepository.findSessionsByUserId(userId)

    return {
        status: ResultStatus.Success,
        data: sessions.map(session => ({
            ip: session.ip,
            title: session.title,
            lastActiveDate: session.lastActiveDate,
            deviceId: session.deviceId,
        })),
        extension: [],
    }
},
```

**Query repository:**

```typescript
// src/security/repositories/security.query-repository.ts

async findSessionsByUserId(userId: string): Promise<DeviceSession[]> {
    return sessionsCollection.find({userId}).toArray()
},
```

**Example response:**
```json
[
  {
    "ip": "192.168.1.1",
    "title": "Chrome on Windows",
    "lastActiveDate": "2026-03-21T10:05:00.000Z",
    "deviceId": "a1b2c3d4-e5f6-..."
  },
  {
    "ip": "10.0.0.5",
    "title": "Safari on iPhone",
    "lastActiveDate": "2026-03-21T09:00:00.000Z",
    "deviceId": "z9y8x7w6-v5u4-..."
  }
]
```

---

### `DELETE /api/security/devices`

> "Log me out everywhere except right here."

Deletes all sessions for the user **except the current one** (identified by the `deviceId` in the current refresh token cookie).

**Requires:** refresh token cookie

**Handler:**

```typescript
// src/security/router/handlers/delete-all-devices.handler.ts

export const deleteAllDevicesHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()
        const currentDeviceId = req.deviceId!

        await securityService.deleteAllOtherSessions(userId, currentDeviceId)

        res.sendStatus(HttpStatuses.NO_CONTENT)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
```

**Service:**

```typescript
// src/security/application/security.application.ts

async deleteAllOtherSessions(userId: string, currentDeviceId: string): Promise<Result<null>> {
    await securityRepository.deleteAllSessionsExceptCurrent(userId, currentDeviceId)

    return {
        status: ResultStatus.Success,
        data: null,
        extension: [],
    }
},
```

**Repository:**

```typescript
// src/security/repositories/security.repository.ts

async deleteAllSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
    await sessionsCollection.deleteMany({userId, deviceId: {$ne: deviceId}})
}
```

**Response:** `204 No Content`

---

### `DELETE /api/security/devices/:deviceId`

> "Log out that specific device."

**Requires:** refresh token cookie

**Handler:**

```typescript
// src/security/router/handlers/delete-device.handler.ts

export const deleteDeviceHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user!._id.toString()
        const {deviceId} = req.params

        const result = await securityService.deleteDeviceSession(userId, deviceId)

        if (result.status === ResultStatus.Success) {
            res.sendStatus(HttpStatuses.NO_CONTENT)
            return
        }

        if (result.status === ResultStatus.NotFound) {
            res.sendStatus(HttpStatuses.NOT_FOUND)
            return
        }

        if (result.status === ResultStatus.Forbidden) {
            res.sendStatus(HttpStatuses.FORBIDDEN)
            return
        }

        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
```

**Service:**

```typescript
// src/security/application/security.application.ts

async deleteDeviceSession(userId: string, targetDeviceId: string): Promise<Result<null>> {
    const session = await securityQueryRepository.findSessionByDeviceId(targetDeviceId)

    if (!session) {
        return {
            status: ResultStatus.NotFound,
            data: null,
            errorMessage: 'Session not found',
            extension: [{field: 'deviceId', message: 'Session not found'}],
        }
    }

    if (session.userId !== userId) {
        return {
            status: ResultStatus.Forbidden,
            data: null,
            errorMessage: 'Forbidden',
            extension: [{field: 'deviceId', message: 'Access denied'}],
        }
    }

    await securityRepository.deleteSessionByDeviceId(targetDeviceId)

    return {
        status: ResultStatus.Success,
        data: null,
        extension: [],
    }
},
```

**Repository:**

```typescript
// src/security/repositories/security.repository.ts

async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
    const result = await sessionsCollection.deleteOne({deviceId})
    return result.deletedCount >= 1
}
```

**Response:**
- `204` — deleted successfully
- `403` — that session belongs to a different user (forbidden)
- `404` — no session with that deviceId exists

---

## What Happens Step by Step

### 1. Login

```
POST /api/auth/login
Body: { loginOrEmail: "john", password: "secret" }
Headers: User-Agent: Mozilla/5.0 Chrome/120...
```

```typescript
// src/auth/application/auth.application.ts

async loginUser(
    loginOrEmail: string,
    password: string,
    ip: string,
    userAgent: string | undefined,
): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const userResult = await this.checkUserCredentials(loginOrEmail, password)

    if (userResult.status !== ResultStatus.Success) {
        return {
            status: ResultStatus.Unauthorized,
            data: null,
            errorMessage: 'Unauthorized',
            extension: [{field: 'loginOrEmail', message: 'Wrong credentials'}],
        }
    }

    const userId = userResult.data!._id.toString()
    const deviceId = randomUUID()                          // fresh UUID per login
    const lastActiveDate = new Date().toISOString()
    const expiresAt = new Date(
        Date.now() + +Settings.REFRESH_TOKEN_EXPIRATION_TIME * 1000,
    )

    await securityRepository.createSession({              // save to sessions collection
        deviceId,
        userId,
        ip,
        title: userAgent || 'Unknown device',
        lastActiveDate,
        expiresAt,
    })

    const accessToken = jwtService.createJWT(userResult.data!)
    const refreshToken = jwtService.createRefreshToken(userId, deviceId)

    return {
        status: ResultStatus.Success,
        data: {accessToken, refreshToken},
        extension: [],
    }
},
```

The refresh token embeds both `userId` and `deviceId`:

```typescript
// src/auth/services/jwtService.ts

createRefreshToken(userId: string, deviceId: string): string {
    return jwt.sign(
        {userId, deviceId},
        Settings.REFRESH_TOKEN_SECRET,
        {expiresIn: +Settings.REFRESH_TOKEN_EXPIRATION_TIME},
    )
},
```

```
← Set-Cookie: refreshToken=eyJ...
← { "accessToken": "eyJ..." }
```

---

### 2. Refresh Token

```
POST /api/auth/refresh-token
Cookie: refreshToken=eyJ...
```

```typescript
// src/auth/application/auth.application.ts

async refreshToken(
    token: string,
    user: WithId<UserViewModel>,
    deviceId: string,
): Promise<Result<{accessToken: string; refreshToken: string} | null>> {
    const session = await securityQueryRepository.findSessionByDeviceId(deviceId)

    if (!session) {
        return {
            status: ResultStatus.Unauthorized,
            data: null,
            errorMessage: 'Unauthorized',
            extension: [{field: 'refreshToken', message: 'Session not found'}],
        }
    }

    const lastActiveDate = new Date().toISOString()
    const expiresAt = new Date(
        Date.now() + +Settings.REFRESH_TOKEN_EXPIRATION_TIME * 1000,
    )

    await AuthRepository.insertTokenToBlackList(token)              // old token blacklisted
    await securityRepository.updateLastActiveDate(deviceId, lastActiveDate, expiresAt)

    const accessToken = jwtService.createJWT(user)
    const refreshToken = jwtService.createRefreshToken(user._id.toString(), deviceId)  // same deviceId

    return {
        status: ResultStatus.Success,
        data: {accessToken, refreshToken},
        extension: [],
    }
},
```

**Repository — update session in place:**

```typescript
// src/security/repositories/security.repository.ts

async updateLastActiveDate(
    deviceId: string,
    lastActiveDate: string,
    expiresAt: Date,
): Promise<void> {
    await sessionsCollection.updateOne(
        {deviceId},
        {$set: {lastActiveDate, expiresAt}},
    )
}
```

```
← Set-Cookie: refreshToken=eyJ...(new)
← { "accessToken": "eyJ...(new)" }
```

---

### 3. Logout

```
POST /api/auth/logout
Cookie: refreshToken=eyJ...
```

```typescript
// src/auth/application/auth.application.ts

async logoutUser(token: string, deviceId: string) {
    try {
        const decoded = jwtService.verifyRefreshToken(token)

        await AuthRepository.insertTokenToBlackList(token, (decoded as JwtPayload).expireAt)
        await securityRepository.deleteSessionByDeviceId(deviceId)

        return {
            status: ResultStatus.Success,
            data: null,
        }
    } catch (e) {
        return {
            status: ResultStatus.Unauthorized,
            data: null,
            errorMessage: 'Invalid refresh token',
        }
    }
}
```

```
← 204 No Content
← Clears the refreshToken cookie
```

After this, any request using that old refresh token gets `401`.

---

### 4. Delete All Other Sessions

```
DELETE /api/security/devices
Cookie: refreshToken=eyJ...   ← this session is kept
```

The handler reads `req.deviceId` (set by `refreshTokenMiddleware`) and passes it to the service as the current session to preserve:

```typescript
// src/security/application/security.application.ts

async deleteAllOtherSessions(userId: string, currentDeviceId: string): Promise<Result<null>> {
    await securityRepository.deleteAllSessionsExceptCurrent(userId, currentDeviceId)
    // ...
}

// src/security/repositories/security.repository.ts
async deleteAllSessionsExceptCurrent(userId: string, deviceId: string): Promise<void> {
    await sessionsCollection.deleteMany({userId, deviceId: {$ne: deviceId}})
}
```

The other devices will get `401` next time they try to refresh — their sessions are gone.

---

## The refreshTokenMiddleware

Every endpoint that uses a refresh token cookie goes through this middleware. Here's the full implementation:

```typescript
// src/core/middlewares/refreshTokenMiddleware.ts

export const refreshTokenMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const refreshToken = req.cookies['refreshToken']

    if (!refreshToken) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED)    // step 1: cookie present?
        return
    }

    const isTokenInBlackList =
        await AuthQueryRepository.getAccessTokenFromBlackList(refreshToken)

    if (isTokenInBlackList) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED)    // step 2: not blacklisted?
        return
    }

    const decoded = jwtService.verifyRefreshToken(refreshToken)

    if (!decoded) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED)    // step 3: valid JWT signature?
        return
    }

    const {userId, deviceId} = decoded as JwtPayload

    const session = await securityQueryRepository.findSessionByDeviceId(deviceId)

    if (!session) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED)    // step 4: session exists in DB?
        return
    }

    const user = await usersQueryRepository.findUserById(userId)

    if (!user) {
        res.sendStatus(HttpStatuses.UNAUTHORIZED)    // step 5: user still exists?
        return
    }

    req.user = user           // ✅ step 6: attach user and deviceId, continue
    req.deviceId = deviceId

    next()
}
```

Step 4 is what makes "delete all other sessions" actually work — the moment a session is deleted from MongoDB, that device's refresh token becomes invalid on the next request.

---

## Why `deviceId` Stays the Same on Refresh

When you refresh your token, you get a brand new refresh token — but the `deviceId` inside it stays the same. This means:

- The session record in MongoDB is **updated**, not replaced
- `lastActiveDate` moves forward (you can see when the device was last active)
- One device = one row in the sessions table, always

---

## What "Unknown device" Means

The `title` field comes from the `User-Agent` HTTP header, which browsers send automatically. We only read it **at login time**:

```typescript
title: userAgent || 'Unknown device',
```

If there's no `User-Agent` header (e.g., a raw curl request with no headers), the title defaults to `"Unknown device"`.

```bash
# This will show "Unknown device" as the title:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginOrEmail":"john","password":"secret"}'
```

---

## IP Rate Limiting — Slowing Down the Bad Guys

Imagine a stranger standing outside a door, trying random keys one after another, super fast. You'd want a rule: "If you try more than 5 times in 10 seconds — the door stops responding for a while." That's exactly what IP rate limiting does.

---

### The Big Idea

Every time someone sends a request to a sensitive auth endpoint (like registration or login), we write down:

> "IP 192.168.1.1 knocked on `/registration` at exactly 10:00:00.123."

If that same IP knocks **5 or more times** within a 10-second window — the door slams: **`429 Too Many Requests`**.

After those 10 seconds pass, the old knocks "fall off" and the IP can try again.

---

### What Gets Stored

Each request is saved in the `rate_limit` collection in MongoDB:

```json
{
  "ip": "192.168.1.1",
  "url": "/registration",
  "date": "2026-03-21T10:00:00.123Z"
}
```

- **ip** — who is knocking
- **url** — which door they're knocking on (each endpoint counted separately!)
- **date** — exactly when they knocked

---

### The Rules

| Knocks in last 10 seconds | What happens |
|---|---|
| 0 – 4 | Request goes through normally |
| 5 or more | `429 Too Many Requests` — stop right there |

After 10 seconds, old records are no longer counted — the window slides forward.

---

### Which Endpoints Are Protected

```
POST /auth/login
POST /auth/registration
POST /auth/registration-confirmation
POST /auth/registration-email-resending
```

Each one is counted **independently**. Spamming `/login` won't affect your `/registration` counter.

---

### The Middleware

```typescript
// src/core/middlewares/ipRateLimit.middleware.ts

const WINDOW_MS = 10 * 1000   // 10 seconds
const MAX_REQUESTS = 5

export const ipRateLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const ip = req.ip
        const url = req.path
        const now = new Date()
        const windowStart = new Date(now.getTime() - WINDOW_MS)

        const count = await rateLimitCollection.countDocuments({
            ip,
            url,
            date: {$gte: windowStart},
        })

        if (count >= MAX_REQUESTS) {
            res.sendStatus(HttpStatuses.TOO_MANY_REQUESTS)   // 429
            return
        }

        await rateLimitCollection.insertOne({ip, url, date: now})

        next()
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
```

---

### The Sliding Window in Action

```
Timeline (seconds):  0    2    4    6    8   10   12   14
Requests from IP X:  R1   R2   R3   R4   R5       R6

At R5 (t=8s):   window = [t-2 to t+8] → 5 records → BLOCKED (429)
At R6 (t=12s):  window = [t+2 to t+12] → R1,R2 have expired → only 3 records → ALLOWED
```

The window always looks back exactly 10 seconds from **right now** — it slides with every request.

---

### Why MongoDB and Not In-Memory?

We could store counters in a plain JavaScript `Map` object in memory. But that would break in tests — each test suite calls `clearDb()` which wipes all collections, resetting the rate limit state cleanly. An in-memory map would bleed state between test suites.

MongoDB also means the rate limit state survives server restarts (important in production).

---

## Where the Code Lives

```
src/security/
├── types/security.types.ts          ← DeviceSession and DeviceViewModel types
├── repositories/
│   ├── security.repository.ts       ← write ops (create, update, delete sessions)
│   └── security.query-repository.ts ← read ops (find by userId, find by deviceId)
├── application/security.application.ts  ← business logic
└── router/
    ├── index.ts                     ← route definitions
    ├── handlers/
    │   ├── get-devices.handler.ts
    │   ├── delete-all-devices.handler.ts
    │   └── delete-device.handler.ts
    └── mapper/
        └── map-to-device-view-model.ts
```

Auth-related changes:
```
src/auth/
├── services/jwtService.ts           ← createRefreshToken now takes deviceId
└── application/auth.application.ts  ← loginUser creates session,
                                        refreshToken updates it,
                                        logoutUser deletes it

src/core/middlewares/
├── refreshTokenMiddleware.ts        ← now validates session exists + sets req.deviceId
└── ipRateLimit.middleware.ts        ← counts requests per IP per endpoint, returns 429

src/core/types/
└── http-statuses.ts                 ← added TOO_MANY_REQUESTS = 429

src/core/db/
└── mongo.db.ts                      ← added rateLimitCollection (rate_limit collection)
```
