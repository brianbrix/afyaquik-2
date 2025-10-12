# AfyaQuik HMS Frontend

This package contains the React + TypeScript single-page application for the AfyaQuik Hospital Management System.

## Prerequisites

- Node.js **>= 20.9** (LTS recommended). Vite 5 and ESLint 9 require modern Node features.
- npm **>= 10** or another compatible package manager (pnpm, yarn).

If you're using `nvm`, run:

```bash
nvm install 20
nvm use 20
```

## Getting started

```bash
npm install
npm run dev
```

The development server uses hash-based routing and will be available at [http://localhost:5173](http://localhost:5173). The dev server automatically reloads when you edit files.

## Configuration

Copy the example environment file and update values as needed:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL for the Spring Boot backend | `http://localhost:8080` |
| `VITE_TENANT_ID` | Default tenant used for the login form and `X-Tenant-Id` header | `tenantA` |

The queue board expects the backend to be reachable at the configured base URL. Ensure the Spring Boot service is connected to PostgreSQL (default `jdbc:postgresql://localhost:5433/afyaquik`).

## Available scripts

- `npm run dev` – start the Vite development server
- `npm run build` – type-check and build the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint on the source tree
- `npm test` – execute Vitest unit/integration suites once (JSDOM environment)

## Authentication & session flow

- Navigate to the login screen at [`#/login`](http://localhost:5173/#/login). The app automatically redirects unauthenticated users to this route.
- Provide a tenant ID (defaults to `tenantA`), username, and password. For local smoke tests you can use the seeded backend account: tenant `tenantA`, username `reception`, password `password`.
- Successful login stores JWT access/refresh tokens and the user profile in `localStorage` under `afyaquik.hms.session`. Tokens are applied to the shared Axios client via the `Authorization` header, and a token refresh is scheduled ~60 seconds before expiry.
- On app start the session is rehydrated, validated via `/auth/me`, and the active role is fetched. If validation fails (tenant mismatch, expired refresh token, etc.) the session is cleared and the user is returned to the login page.
- Use the avatar dropdown in the top navigation to sign out. This clears cached tokens, removes the tenant header, and redirects to the login screen.

## Project structure

```
src/
  app/                # Providers, routes, and app-level composition
  components/         # Reusable UI components (layout, shared)
  hooks/              # Custom React hooks
  modules/            # Feature modules (dashboard, queue, patients, scheduling, reports)
  services/           # API clients and data access layers
  styles/             # Global styles and theme overrides
```

## Next steps

- Integrate progressive token refresh within Axios interceptors to catch late 401 responses.
- Extend queue visualisations (drag-and-drop lanes, SLA badges) and add notifications.
- Flesh out scheduling, diagnostics, and billing modules with real data sources.
