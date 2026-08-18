# Wink Me Club — Documentation Overview

## System Architecture

Wink Me Club is built as a full-stack monorepo application separating the web presentation layer (`client`) from backend business logic and database persistence (`server`).

### Components Diagram
```
+-------------------------------------------------------+
|                    Client (React)                     |
|  - Vite, TS, Tailwind CSS, TanStack Query, Router    |
|  - Auth Context, UI Design System, Notification state|
+---------------------------+---------------------------+
                            | REST API (JSON)
+---------------------------v---------------------------+
|                    Server (Express)                   |
|  - Middleware (Auth JWT, Admin Guard, Validation)     |
|  - Controllers & REST Routes                          |
|  - Isolated Service Layer (Wallet, Trade, Auth, etc)  |
+---------------------------+---------------------------+
                            | Mongoose ODM
+---------------------------v---------------------------+
|                    MongoDB Database                   |
|  - Collections: Users, Wallets, Transactions, Trades, |
|    Products, DateRequests, Verifications, etc.        |
+-------------------------------------------------------+
```

### Financial Architecture & Balance Safety
- **Available Balance**: Funds currently unlocked and ready for trades, withdrawals, or date requests.
- **Frozen Balance**: Funds locked during active trading positions or pending withdrawal requests.
- **Transactions Ledger**: Immutably records balance changes before/after each financial operation.
- **Trade Settlement Logic**: Isolated inside `server/src/services/tradeSettlement.service.ts` allowing configurable outcome rules (Win/Lose payouts and fee factors).

### Centralized Branding
- Brand parameters are managed in `client/src/config/brand.config.ts` and `server/src/config/brand.config.ts`.
- Updating the brand name ("Wink Me Club"), taglines, or financial defaults will propagate across all UI pages and API dispatches.
