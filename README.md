# Wink Me Club — Complete Full-Stack Web Application

![Wink Me Club](https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80)

**Wink Me Club** is an exclusive, premium full-stack social platform combining profile discovery, date requests, VIP membership verification, multi-currency user wallet balance handling, product trading marketplace, admin-controlled trade settlements, interactive customer support ticketing, announcements, and a full-featured admin dashboard.

---

## Key Features

- **Social & Matching**: Browse recommended profile cards with city/age/gender/VIP filters, date request proposals, and detailed bio modal views.
- **VIP Membership & Verification**: Identity document upload, selfie verification status flow, and admin badge approval.
- **Wallet Engine**: Dual balance management (Available & Frozen balances) with atomic transaction recording for recharges, bank withdrawals, and locked trade holds.
- **Product Trading**: Dynamic product catalog with single-click trading and admin trade control (`WIN` / `LOSE` settlement logic).
- **Admin Command Center**: Complete oversight of Users, Balances, Trade Requests, Recharges, Withdrawals, Verifications, Product CRUD, Customer Support Tickets, and Audit Logging.
- **Dark VIP Aesthetics**: Designed with charcoal background (`#0b0d14`), deep wine/burgundy primary elements, and rich gold accents.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Lucide React Icons
- **State & Data Fetching**: TanStack Query (React Query) + Axios
- **Form Validation**: React Hook Form + Zod
- **Data Visualization**: Recharts

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing
- **Security & Logging**: Helmet, CORS, Rate limiting, Morgan logger

---

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Seed demo database (Admin + Demo User + 25 Profiles + 10 Products)
npm run seed

# 3. Start development servers
npm run dev
```

### Access Points
- **User Application**: [http://localhost:5173](http://localhost:5173)
- **Admin Panel**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)

### Demo Credentials
- **User**: `user@winkmeclub.com` / `User@123`
- **Admin**: `admin@winkmeclub.com` / `Admin@123`
