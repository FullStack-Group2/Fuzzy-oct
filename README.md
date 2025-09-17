## Fuzzy E‑Commerce Platform

A full‑stack furniture e‑commerce app built as a pnpm monorepo with a Vite + React client and an Express + TypeScript + MongoDB API. Includes role‑based auth (Customer, Vendor, Shipper), product/catalog management, order workflows, image uploads, an AI helper, and real‑time chat via Socket.IO.

## Features

- **Auth & roles**: JWT auth, registration/login for Vendor, Customer, Shipper
- **Catalog**: Products, categories, search/filtering (on FE), stock/sale fields
- **Orders**: Order, items, status tracking; vendor/customer views
- **Uploads**: Image upload and static serving under `/uploads`
- **AI assistant**: Product/navigation helper backed by Fireworks AI
- **Realtime chat**: Authenticated Socket.IO messaging between users
- **Responsive UI**: React, Tailwind CSS, Router, Redux Toolkit

## Tech Stack

- **Client**: React 18, TypeScript, Vite, React Router, Redux Toolkit, Tailwind
- **Server**: Node.js, Express, TypeScript, MongoDB/Mongoose, JWT, Zod, Multer
- **Realtime**: Socket.IO
- **Dev**: pnpm, ESLint, Prettier, ts-node, nodemon

## Monorepo Layout

- `client/`: Vite React app (aliases `@ -> client/src`)
- `server/`: Express API (`src/app.ts` mounted at `/api`, `src/server.ts` bootstraps HTTP + Socket.IO)

## Prerequisites

- Node.js 18+
- pnpm
- MongoDB connection (Atlas or local)

## Environment Variables

Create a `.env` at the repository root (the server loads from the root path):

```bash
# .env (root)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Optional: AI assistant
FIREWORKS_API_KEY=your_fireworks_api_key

# Optional: Twilio (email OTP via Verify)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...

# Server port (default 5001)
PORT=5001
```

Client can work without config; to point it at a non‑default API, create `client/.env`:

```bash
# client/.env
VITE_API_BASE=http://localhost:5001/api
```

## Install

```bash
pnpm install
```

## Develop

Run client and server together from the repo root:

```bash
pnpm dev
```

- **Client**: Vite on `http://localhost:5173`
- **Server**: REST API on `http://localhost:5001/api`

## Build

Build both workspaces:

```bash
pnpm build
```

To preview the built client locally:

```bash
pnpm -C client preview
```

To run the built server:

```bash
pnpm -C server build && pnpm -C server start
```

## Scripts

- **Root**
  - `pnpm dev`: run client and server in parallel
  - `pnpm build`: build client and server
  - `pnpm lint`, `pnpm lint:fix`: ESLint
  - `pnpm format`, `pnpm format:check`: Prettier
- **Client** (`client/`)
  - `pnpm dev`: Vite dev server
  - `pnpm build`: Vite build
  - `pnpm preview`: serve production build locally
- **Server** (`server/`)
  - `pnpm dev`: run `ts-node src/server.ts`
  - `pnpm build`: TypeScript compile
  - `pnpm start`: run compiled server (`dist/server.js`)

## API Overview (selected)

Base URL: `http://localhost:5001/api`

- **Auth**: `POST /auth/register/vendor|customer|shipper`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/verify-code`, `POST /auth/reset-password`, `POST /auth/change-password/:id`
- **Vendors**: mounted at `/vendors` (includes product creation/listing under vendor)
- **Customers**: `/customers`
- **Shippers**: `/shippers` (uses `hubId` in JWT payload)
- **Hubs**: `/hubs` (also legacy `/distributionHub`)
- **Uploads**: `POST /upload` (Multer), static files served at `/uploads/*`
- **AI**: `POST /ai/chat` (requires `FIREWORKS_API_KEY`)
- Legacy mapping: `/products` routes are exposed via `vendorRoutes`

All protected routes require an `Authorization: Bearer <token>` header.

## Realtime Chat

Socket.IO server runs alongside HTTP on the same port (5001). Clients must provide a JWT via `handshake.auth.token` or `Authorization` header. Events:

- `send-message` `{ receiver, content }` → server persists and emits `receive-message`
- `receive-message` is emitted to both receiver and sender

Vendor can query conversations: `GET /api/chat/conversations/:customerId` (auth required). History for a peer: `GET /api/chat/:receiverId`.

## Notes

- Static uploads are available at `/uploads/<filename>`.
- Vite path alias: import with `@/...` from `client/src`.
- Default ports: client 5173, server 5001. Adjust via `VITE_API_BASE` and `PORT` if needed.
