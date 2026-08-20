# HarvestHub-Server

NestJS + MongoDB backend for HarvestHub, an agricultural marketplace platform.
Scaffolded from the same framework/conventions as XaminityIQ-Server, adapted to
HarvestHub's own domain (see `database/` and `modules/` for the full requirement
docs this scaffold was built against).

## What's implemented

- **Auth module** (`src/api/auth/`) — login (by phone or email), self-registration
  (Farmer/Buyer only), logout, JWT access+refresh tokens, forced first-login
  password change, forgot/reset password.
- **Roles** (`src/utils/enum.ts`) — `SUPER_ADMIN`, `DISTRICT_ADMIN`, `INSPECTOR`,
  `FARMER`, `BUYER`, `DELIVERY_PARTNER`. Only `SUPER_ADMIN`/`FARMER`/`BUYER`/
  `DELIVERY_PARTNER` have a working module today — `DISTRICT_ADMIN`/`INSPECTOR`
  are guardable but have no module yet (they depend on District Management,
  module 02, which isn't built).
- **One working example endpoint per existing role** — `GET /<role>/profile`,
  following the controller → service → repository → schema layering convention.
  None of the roles have a dedicated profile schema yet (see below) — the
  endpoint just returns the base `User` fields for now.
- **Generic infra** — global JWT/role guards, `@Roles()`/`@CurrentUser()`
  decorators, `ConfigService` (env accessor), `CloudinaryService` (signed
  uploads), refresh-token cookie helpers, and the seeder pattern
  (`npm run seed` bootstraps the initial Super Admin from `.env`).

## What's intentionally NOT built yet

Everything in `modules/02` through `modules/12` (district management, catalog,
inspections, collection centers, bidding, payments/escrow, orders/delivery,
notifications, disputes, admin reporting, localization) — those are real
business modules to build next, using the same layering pattern demonstrated
in the auth/profile endpoints. `database/*.md` describes the target schema for
each of those collections.

Also not built: OTP-based phone verification (needs the Notification module),
and dedicated `FarmerProfile`/`BuyerProfile`/`DeliveryPartnerProfile` schemas
(see `database/farmer-profiles.md` etc.) — those roles currently only have the
base `User` fields.

## Setup

```bash
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secrets, Cloudinary creds, initial admin creds
npm run seed            # creates the initial Super Admin account
npm run start:dev
```
