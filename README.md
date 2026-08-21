# HarvestHub-Server

NestJS + MongoDB backend for HarvestHub, an agricultural marketplace platform.
Scaffolded from the same framework/conventions as XaminityIQ-Server, adapted to
HarvestHub's own domain (see `database/` and `modules/` for the full requirement
docs this scaffold was built against).

## What's implemented

- **Auth module** (`src/api/auth/`) — login (by phone or email), self-registration
  (Farmer/Buyer only), logout, JWT access+refresh tokens, forced first-login
  password change, forgot/reset password.
- **District Management module** (`src/api/district-management/`) — Super Admin
  CRUD on districts (create/update/deactivate), assign/reassign a District Admin
  (maintains the 1 district <-> 1 admin invariant from both sides), a district
  directory with summary stats (active farmers/buyers — products/orders are
  stubbed at 0 until Catalog/Order modules exist), and Collection Center
  create/update/list/get with District Admin access scoped to their own
  district (enforced by loading their `User.districtId`, since it isn't in the
  JWT payload).
- **Roles** (`src/utils/enum.ts`) — `SUPER_ADMIN`, `DISTRICT_ADMIN`, `INSPECTOR`,
  `FARMER`, `BUYER`, `DELIVERY_PARTNER`. `SUPER_ADMIN`/`FARMER`/`BUYER`/
  `DELIVERY_PARTNER`/`DISTRICT_ADMIN` have a working module today —
  `INSPECTOR` is guardable but has no module yet (depends on Inspection
  Management, module 04). Note: there's still no API to create a
  `DISTRICT_ADMIN` account (self-registration is Farmer/Buyer-only, and
  admin-onboarded account creation for District Admin/Inspector isn't built)
  — `districts/:id/assign-admin` expects a user that already has that role.
- **One working example endpoint per existing role** — `GET /<role>/profile`,
  following the controller → service → repository → schema layering convention.
  None of the roles have a dedicated profile schema yet (see below) — the
  endpoint just returns the base `User` fields for now.
- **Generic infra** — global JWT/role guards, `@Roles()`/`@CurrentUser()`
  decorators, `ConfigService` (env accessor), `CloudinaryService` (signed
  uploads), refresh-token cookie helpers, and the seeder pattern
  (`npm run seed` bootstraps the initial Super Admin from `.env`).

## What's intentionally NOT built yet

Everything in `modules/03` through `modules/12` (catalog, inspections,
bidding, payments/escrow, orders/delivery, notifications, disputes, admin
reporting, localization) — those are real business modules to build next,
using the same layering pattern demonstrated in the auth/district-management
endpoints. `database/*.md` describes the target schema for each of those
collections.

Also not built within District Management itself: the business rule blocking
district deactivation while it has products in an active lifecycle state
(needs the Catalog module, module 03 — see the `TODO` in
`src/services/district-service/district.service.ts`).

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
