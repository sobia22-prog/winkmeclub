# Wink Me Club — Setup & Installation Guide

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**
- **MongoDB**: Local instance running at `mongodb://localhost:27017` or a MongoDB Atlas URI.

## Installation Steps

1. **Install Monorepo Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` in `server/` to `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/winkmeclub
   JWT_SECRET=wink_me_club_super_secret_jwt_key_2026
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

   Copy `.env.example` in `client/` to `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Seed Database**:
   Populate admin account, demo user, 25+ social profiles, 10 trade products, sample transactions, and support tickets:
   ```bash
   npm run seed
   ```

4. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - Client will launch at `http://localhost:5173`
   - Server will launch at `http://localhost:5000`

## Demo Accounts
- **Demo User**: `user@winkmeclub.com` / `User@123`
- **Demo Admin**: `admin@winkmeclub.com` / `Admin@123`
