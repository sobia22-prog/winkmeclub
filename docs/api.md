# Wink Me Club — API Documentation

All API endpoints are prefixed with `/api`. Authentication uses Bearer JWT tokens in the `Authorization` header.

## Core Endpoints Overview

### Authentication `/api/auth`
- `POST /api/auth/register` — Create a new account & generate verification OTP.
- `POST /api/auth/verify-otp` — Validate 6-digit OTP code & return JWT token.
- `POST /api/auth/resend-otp` — Resend verification OTP code.
- `POST /api/auth/login` — User authentication returning JWT token & profile summary.
- `POST /api/auth/admin-login` — Admin login.
- `GET /api/auth/me` — Return current authenticated user profile.
- `POST /api/auth/forgot-password` — Request password reset OTP.
- `POST /api/auth/reset-password` — Verify OTP and update password.

### Social & Profiles `/api/profiles` & `/api/matches`
- `GET /api/matches` — Fetch randomized/recommended match profiles (filters: city, age, gender, VIP).
- `GET /api/profiles/:id` — View detailed public profile.
- `POST /api/date-requests` — Submit date request for a profile.
- `GET /api/date-requests` — View sent/received date proposals.

### Verification & VIP `/api/verifications`
- `POST /api/verifications` — Upload ID details & selfie for VIP verification.
- `GET /api/verifications/status` — Get current verification status and rejection reasons.

### Wallet & Financial `/api/wallet`, `/api/recharges`, `/api/withdrawals`
- `GET /api/wallet` — Retrieve available, frozen, total balance & recent activity.
- `POST /api/recharges` — Submit recharge add-funds request (payment method, ref, receipt).
- `POST /api/withdrawals` — Request bank withdrawal (moves funds to frozen balance).
- `GET /api/transactions` — Ledger history with type filters and pagination.

### Products & Trading `/api/products`, `/api/trades`
- `GET /api/products` — Browse active trading products.
- `POST /api/trades` — Execute product trade (locks balance into frozen status).
- `GET /api/trades` — List active and historical user trades.

### Admin Operations `/api/admin`
- `GET /api/admin/dashboard` — Platform KPIs, analytics, revenue growth, active users.
- `GET /api/admin/users` — Search/filter user directory, view full user detail.
- `POST /api/admin/users/:id/balance` — Manual balance adjustments (Add/Freeze/Unfreeze).
- `PATCH /api/admin/users/:id/status` — Toggle user suspension or VIP status.
- `GET /api/admin/trades` — View pending trades.
- `POST /api/admin/trades/:id/settle` — Resolve trade as `WIN` or `LOSE`.
- `POST /api/admin/recharges/:id/approve` | `reject` — Review add-funds requests.
- `POST /api/admin/withdrawals/:id/approve` | `reject` | `complete` — Manage payouts.
- `POST /api/admin/verifications/:id/approve` | `reject` — Review VIP submissions.
- `POST /api/admin/products` — Create or edit marketplace products.
- `GET /api/admin/audit-logs` — Audit log of all sensitive admin actions.
