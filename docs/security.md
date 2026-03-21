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

Every session is saved in the `sessions` collection in MongoDB:

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

### `GET /api/security/devices`

> "Show me all my active sessions."

**Requires:** refresh token cookie

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

**Response:** `204 No Content`

---

### `DELETE /api/security/devices/:deviceId`

> "Log out that specific device."

**Requires:** refresh token cookie

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

Server does:
1. Checks credentials ✅
2. Generates a fresh `deviceId = "a1b2c3d4-..."`
3. Saves a session to MongoDB
4. Creates a refresh token with `{ userId, deviceId }` baked in
5. Sets the refresh token as an `httpOnly` cookie
6. Returns an access token in the response body

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

Server does:
1. Reads `deviceId` from the token
2. Checks session exists in DB — if not, `401 Unauthorized`
3. Updates `lastActiveDate` on the session
4. Blacklists the old refresh token (so it can't be reused)
5. Issues new access + refresh tokens with the **same** `deviceId`

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

Server does:
1. Reads `deviceId` from the token
2. Deletes the session from MongoDB
3. Blacklists the refresh token

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

Server does:
1. Reads `deviceId` from the token (current session)
2. Deletes all sessions for this user **where deviceId ≠ current**

The other devices will get `401` next time they try to refresh — their sessions are gone.

---

## The refreshTokenMiddleware

Every endpoint that uses a refresh token cookie goes through this middleware. Here's what it checks, in order:

```
1. Is there a refreshToken cookie?          → No  → 401
2. Is the token in the blacklist?           → Yes → 401
3. Is the JWT signature valid?              → No  → 401
4. Does a session exist for this deviceId? → No  → 401
5. Does the user still exist in DB?        → No  → 401
6. ✅ Set req.user and req.deviceId, continue
```

Step 4 is the new one added for this feature. It's what makes "delete all other sessions" actually work — the moment a session is deleted from MongoDB, that device's refresh token becomes invalid on the next request.

---

## Why `deviceId` Stays the Same on Refresh

When you refresh your token, you get a brand new refresh token — but the `deviceId` inside it stays the same. This means:

- The session record in MongoDB is **updated**, not replaced
- `lastActiveDate` moves forward (you can see when the device was last active)
- One device = one row in the sessions table, always

---

## What "Unknown device" Means

The `title` field comes from the `User-Agent` HTTP header, which browsers send automatically. We only read it **at login time**.

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

### What Happens Step by Step

```
POST /auth/registration   ← request arrives
```

The `ipRateLimitMiddleware` runs first, before any validation or business logic:

```
1. Read the IP from req.ip and the path from req.path
2. Calculate the window start = now - 10 seconds
3. Count documents in rate_limit where { ip, url, date >= windowStart }
4. Count >= 5?  → Yes → 429, stop here
                → No  → insert { ip, url, date: now } and continue
```

If the request gets through, it proceeds normally to validation and the handler.

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

### The Middleware

```typescript
// src/core/middlewares/ipRateLimit.middleware.ts

const WINDOW_MS = 10 * 1000   // 10 seconds
const MAX_REQUESTS = 5

export const ipRateLimitMiddleware = async (req, res, next) => {
    const ip = req.ip
    const url = req.path
    const windowStart = new Date(Date.now() - WINDOW_MS)

    const count = await rateLimitCollection.countDocuments({
        ip,
        url,
        date: { $gte: windowStart },
    })

    if (count >= MAX_REQUESTS) {
        res.sendStatus(429)   // Too Many Requests
        return
    }

    await rateLimitCollection.insertOne({ ip, url, date: new Date() })
    next()
}
```

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
