# Password Recovery Feature

## Flow

### Step 1 — POST /auth/password-recovery
- Client sends `{ email: string }`
- Server finds user by email
- If user **not found** → return `204` silently (don't leak email existence)
- If user found → generate `recoveryCode = randomUUID()`, set `expirationDate = add(new Date(), { hours: 1 })`
- Save to DB: `passwordRecovery.recoveryCode` + `passwordRecovery.expirationDate`
- Send email with link containing `?recoveryCode=<code>`
- Return `204`

### Step 2 — POST /auth/password-recovery-confirmation
- Client sends `{ newPassword: string, recoveryCode: string }`
- Server finds user by `passwordRecovery.recoveryCode`
- If user **not found** → return `400` (invalid code)
- If `passwordRecovery.expirationDate < new Date()` → return `400` (code expired)
- Hash `newPassword`, update `passwordHash` in DB
- Clear recovery data (null out `passwordRecovery.recoveryCode` and `passwordRecovery.expirationDate`)
- Return `204`

---

## Edge Cases

| Case | Expected |
|---|---|
| Email not registered | `204` (silent success) |
| Valid email, user exists | `204` + email sent |
| Recovery code not found in DB | `400` |
| Recovery code expired | `400` |
| Recovery code already used (cleared) | `400` (not found) |
| Valid code + valid new password | `204` + password updated + code cleared |
| Reusing same code after success | `400` (code was cleared) |

---

## Test Cases (to be implemented)

### POST /auth/password-recovery

- [ ] `204` when email is not registered (silent)
- [ ] `204` when email is registered
- [ ] `400` when email format is invalid
- [ ] `400` when email field is missing
- [ ] recovery code is saved to DB after success
- [ ] email is sent (mock emailService)

### POST /auth/password-recovery-confirmation

- [ ] `204` when recoveryCode is valid and not expired
- [ ] `400` when recoveryCode does not exist
- [ ] `400` when recoveryCode is expired
- [ ] `400` when newPassword is missing
- [ ] `400` when newPassword is too short (< 6 chars)
- [ ] passwordHash is updated in DB after `204`
- [ ] recovery code is cleared from DB after `204`
- [ ] same code cannot be used twice (second attempt → `400`)
- [ ] user can login with new password after recovery

---

## Test Cases (implemented)

_Update this section after writing tests._
